#!/usr/bin/env bash
# Déploiement du client web Delibera sur l'EC2, en conteneur (lancé par GitHub Actions en SSH).
#
#   bash remote-deploy.sh deployer <image> [<utilisateur du registre>]
#       installe /tmp/delibera-front-compose.yaml et l'image <image> comme nouvelle version.
#       Le jeton du registre (ghcr.io), s'il est fourni, arrive sur l'entrée standard ; il n'est
#       jamais écrit sur le disque de façon durable.
#   bash remote-deploy.sh revenir
#       réactive la version précédente (son image est encore sur l'instance).
#
# Une version = /opt/delibera-front/releases/<version>/{compose.yaml,version.env}. Les liens current
# et previous désignent la version active et la précédente ; delibera-front-compose (Terraform)
# lance current. Si /app/sante ne répond pas UP à temps, la version précédente est réactivée.
set -euo pipefail

BASE=/opt/delibera-front
RELEASES="$BASE/releases"
COMPOSE_RECU=/tmp/delibera-front-compose.yaml
COMPOSE=/usr/local/sbin/delibera-front-compose
SANTE_URL=http://127.0.0.1:3002/app/sante
ATTENTE_MAX=90
GARDER_VERSIONS=5

echec() { echo "✖ $*"; exit 1; }

if [ ! -x "$COMPOSE" ] || ! command -v docker >/dev/null; then
  echec "instance non préparée pour le client web : relancer « terraform apply » (dépôt infra)"
fi
[ -f "$BASE/.provisioned" ] || echec "instance non préparée : $BASE/.provisioned absent"

version_valide() { [ -f "$1/compose.yaml" ] && [ -f "$1/version.env" ]; }

image_de() { sed -n 's/^DELIBERA_FRONT_IMAGE=//p' "$1/version.env"; }

en_bonne_sante() { curl -fsS --max-time 5 "$SANTE_URL" 2>/dev/null | grep -q '"status":"UP"'; }

attendre_sante() {
  local debut=$SECONDS
  until en_bonne_sante; do
    if (( SECONDS - debut >= ATTENTE_MAX )); then
      return 1
    fi
    sleep 2
  done
  echo "✔ en bonne santé après $(( SECONDS - debut )) s"
}

journal() {
  echo "── derniers journaux du client web ──"
  sudo "$COMPOSE" logs --no-color --tail 80 front || true
}

# Lance la version $1 : previous <- ancienne current, current <- $1, puis docker compose up.
activer() {
  local cible="$1" actuelle
  actuelle="$(readlink -e "$BASE/current" || true)"
  if [ -n "$actuelle" ] && [ "$actuelle" != "$cible" ] && version_valide "$actuelle"; then
    ln -sfn "$actuelle" "$BASE/previous"
  fi
  ln -sfn "$cible" "$BASE/current"
  echo "▶ démarrage de $(basename "$cible") ($(image_de "$cible"))"
  sudo "$COMPOSE" up -d --remove-orphans
}

# Garde les $GARDER_VERSIONS versions les plus récentes, plus current et previous ; supprime les
# images des versions effacées.
nettoyer_versions() {
  local actuelle precedente version image
  actuelle="$(readlink -e "$BASE/current" || true)"
  precedente="$(readlink -e "$BASE/previous" || true)"
  find "$RELEASES" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | cut -d' ' -f2- \
    | tail -n +$(( GARDER_VERSIONS + 1 )) | while read -r version; do
      if [ "$version" != "$actuelle" ] && [ "$version" != "$precedente" ]; then
        image=""
        if [ -f "$version/version.env" ]; then image="$(image_de "$version")"; fi
        rm -rf "$version"
        if [ -n "$image" ]; then sudo docker image rm "$image" >/dev/null 2>&1 || true; fi
      fi
    done
  sudo docker image prune -f >/dev/null || true
}

recuperer_image() {
  local image="$1" utilisateur="$2" jeton="" config
  if [ ! -t 0 ]; then IFS= read -r jeton || true; fi
  config="$(mktemp -d)"
  # shellcheck disable=SC2064 # le dossier est connu maintenant : c'est voulu
  trap "sudo rm -rf '$config'" EXIT
  if [ -n "$jeton" ] && [ -n "$utilisateur" ]; then
    printf '%s' "$jeton" | sudo DOCKER_CONFIG="$config" docker login "${image%%/*}" -u "$utilisateur" --password-stdin >/dev/null
  fi
  echo "▶ téléchargement de $image"
  sudo DOCKER_CONFIG="$config" docker pull -q "$image" >/dev/null
  sudo rm -rf "$config"
  trap - EXIT
}

deployer() {
  local image="$1" utilisateur="${2:-}" version nouvelle precedente lien_previous
  [[ "$image" =~ ^[a-z0-9./_-]+:[A-Za-z0-9._-]+$ ]] || echec "image invalide : $image"
  [ -f "$COMPOSE_RECU" ] || echec "$COMPOSE_RECU absent"
  version="${image##*:}"
  nouvelle="$RELEASES/$version"

  recuperer_image "$image" "$utilisateur"

  precedente="$(readlink -e "$BASE/current" || true)"
  if [ -n "$precedente" ] && ! version_valide "$precedente"; then precedente=""; fi
  lien_previous="$(readlink -e "$BASE/previous" || true)"

  mkdir -p "$nouvelle"
  install -m 644 "$COMPOSE_RECU" "$nouvelle/compose.yaml"
  printf 'DELIBERA_FRONT_IMAGE=%s\n' "$image" > "$nouvelle/version.env"
  touch "$nouvelle"
  rm -f "$COMPOSE_RECU"

  if activer "$nouvelle" && attendre_sante; then
    nettoyer_versions
    echo "✔ version $version en service"
    return 0
  fi

  echo "✖ la version $version ne répond pas"
  journal
  if [ -n "$precedente" ] && [ "$precedente" != "$nouvelle" ]; then
    echo "↩ retour automatique à $(basename "$precedente")"
    ln -sfn "$precedente" "$BASE/current"
    sudo "$COMPOSE" up -d --remove-orphans || true
    if [ -n "$lien_previous" ] && version_valide "$lien_previous"; then
      ln -sfn "$lien_previous" "$BASE/previous"
    else
      rm -f "$BASE/previous"
    fi
    if attendre_sante; then
      echo "↩ $(basename "$precedente") est de nouveau en service"
    else
      echo "✖ la version précédente ne répond pas non plus"
      journal
    fi
  else
    echo "✖ aucune version précédente à réactiver"
  fi
  exit 1
}

revenir() {
  local precedente
  precedente="$(readlink -e "$BASE/previous" || true)"
  if [ -z "$precedente" ] || ! version_valide "$precedente"; then
    echec "aucune version précédente disponible"
  fi
  activer "$precedente"
  if attendre_sante; then
    echo "✔ retour à $(basename "$precedente") terminé"
  else
    journal
    echec "la version $(basename "$precedente") ne répond pas"
  fi
}

case "${1:-}" in
  deployer) [ -n "${2:-}" ] || echec "usage : $0 deployer <image> [<utilisateur du registre>]"; deployer "$2" "${3:-}" ;;
  revenir) revenir ;;
  *) echec "usage : $0 deployer <image> [<utilisateur du registre>] | revenir" ;;
esac
