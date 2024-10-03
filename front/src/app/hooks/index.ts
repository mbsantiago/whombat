/**
 * @module app/hooks
 *
 * A collection of custom React hooks designed specifically for this
 * application.
 *
 * This module provides a set of reusable hooks that encapsulate complex logic
 * and state management specific to the needs of this application.  While the
 * hooks in `@/lib/hooks` are more general-purpose and can be reused in different
 * contexts, the hooks here are tailored to leverage application-specific data,
 * services, and components.
 *
 * **Note for Developers:**  For hooks that are specific to certain parts of
 * the application, it's generally a better practice to place them closer to
 * where they are used. For example, if a hook is only relevant to annotation
 * projects, consider placing it in the `app/.../annotation_projects/hooks/`
 * folder. Reserve this `app/hooks` module for hooks that are truly common and
 * used throughout the entire application.
 *
 * Within this module, you have full access to all Next.js-provided hooks,
 * storage mechanisms, and API hooks. However, to promote reusability,
 * testability, and better modularity, aim to implement most of your logic and
 * behavior in 'generic' hooks located in the `@/lib/hooks/` folder. This module
 * should primarily handle app-specific data processing and interactions.**
 */
