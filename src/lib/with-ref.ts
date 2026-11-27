import * as React from "react";

/**
 * Rend un composant écrit « ref en prop » (style React 19) compatible avec React 18.
 * En React 18, `ref` n'est pas transmis aux fonctions : forwardRef le réinjecte dans les props,
 * qui sont ensuite étalées sur l'élément racine.
 */
export function withRef<P extends object>(render: (props: P) => React.ReactNode) {
  const Component = React.forwardRef<unknown, React.PropsWithoutRef<P>>((props, ref) =>
    render({ ...(props as P), ref } as P) as React.ReactElement,
  );
  Component.displayName = render.name;
  return Component;
}
