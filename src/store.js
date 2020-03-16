import { createEffect, createEvent, createStore, createDomain } from 'effector'

/**
 * Store your crap properly or it's going in trash.
 * - mum
 *
 * Anyway, this is the "store" for the states in the entire UI Client. I have
 * been progressively observing and noting the requirements of the UI, so this
 * is an attempt to reflect the ideas.
 *
 * First: Minimum state data on each page. Lets call it the $app state.
 * We have some variables to store here. Obviously!
 * The global state is accessible everywhere and contains:
 *  - Auth status. If logged in, then user's name, uid, and locale.
 *  - Language. In order of preference: User's locale; Browser Reported Locale; English.
 *  - UI Prefs. Currently, only UI theme: dark/light.
 *
 * Next comes the page specific stores. $resources; $concepts; $atlas;
 */

/**
 * I realise I was digressing, so let's focus on dashboard. Dashboard. Yes.
 * A board of Dash. Obviously.
 *
 * On dashboard, let's whip up a spec. We need:
 *  - to fetch the appropriate list of resources
 *  - to create a "view" of those resources -- the "view" is what's actually shown
 *  - a "filter" method, which magically drinks all the resources; eats the filter
 *    and spits out the "view".
 *  - obviously the filters need their own state. So add that to the magical store.
 *
 * Alright, spec done. Now to making it work. Recall (even though it's right there ^)
 * that the filtered resources make a view. So what's the view, what's the filter,
 * and how do we define them?
 *
 * Ah well... I'll be back.
 */

/**
 * Alright, anticipating future, we call resources $posts. And concepts $tags.
 * And Learners, $users. a $post can have 0+ decendants. $tags also. And so on.
 *
 * Assuming an abstract object, we have an object having {in, out}wards links.
 * Constraining inward link to be 1, we make it a parent. Y'know basic structs.
 */

// start big. Lets do the filters first.
const $filters = createDomain()
