# Changelog

> Thanks for trying WeLearn! This document highlights major and minor changes
> to the extension and web app.

> Found a bug? You can help us! Let us know any feature requests, bugs,
> or problems. Write to us at [welearn@cri-paris.org][email].
> 
> WeLearn is available as a prototype quality software, which essentially means
> that there are bugs, missing features, and incomplete user experience. 

Here is what's new in this version of WeLearn extension:

## v0.0.47
Under Preparation

This is a lots of changes for a single release! So, we're gonna make a leap here.

- Real authentication system! Thanks for waiting. As previously mentioned, we've
  set up an OpenID and OAuth2 based identity service at Learning Planet.
- 

## v0.0.46
Released on `2019-12-30`

- Bugfix #53: Regression in WikiPedia suggestions which don't include the page
  summary. Fixed in #56.

## v0.0.45
Released on `2019-12-16`

- Bugfix #44: Labels on map are not rendered correctly if devicePixelRatio is
  fractional. Fixed in #51.

## v0.0.44
Released on `2019-12-11`

- A brand new Onboarding Page, designed to give a quick overview about how
  to use WeLearn and associated features.
- Browse as guest. Want to evaluate WeLearn without sharing your email? Now
  you can browse with a demo user account.
- The entire codebase for WeLearn Web Extension, and Web App is public.
  Check it out: [CyberCRI/learn-ext](https://github.com/CyberCRI/learn-ext).
- You can disable changelogs from showing automatically in settings.

Please feel free to open new issues for any bugs or feature request on GitHub!

## v0.0.43
Released on `2019-11-26`

- You can finally Delete resources or concepts linked to the resources from
  your library.
- A new version of DotAtlas. This was generously provided by DotAtlas team
  for WeLearn Project. [carrotsearch.com](https://carrotsearch.com/)
- Few minor bug fixes.

> **PS**: We'll add an option to _not_ open this page automatically when the
> extension updates, in the next release! Our apologies if we interrupted
> your workflow.


## Next Up

Next release is planned soon. Major features are:

- Secure your account with email based authentication.
- Customise your privacy preferences.
- We'll further strip-down the extension and make the web-based interface
  default.

## v0.0.41-42

Released on `2019-11-22`

This is a preview release.

- Make all the resource cards open the resource url in new tab on clicks.
- Fix a few typos in changelog (we got the email wrong.)

## v0.0.40

Released on `2019-11-18`

### Summary
- A new codename: iLearn is now WeLearn.
- Brand new Discover Tab. Use it to see your learning landscape.
- Browse through your group, or other users' resources on Discover.
- Access your resources on any device, any time. We're live at
  [v2.ilearn.cri-paris.org][homepage].


> **PS**: v0.0.38 and v0.0.39 were not published due to incomplete feature
> set, and production bugs.

## v0.0.37

Released on `2019-09-10`

### Summary
- We've split the extension from Dashboard, Discover, and other pages from
  extension. This makes the browser extension light weight and allows you
  to browse, edit, and organise your resources on any device.
- Dashboard is faster and loads content progressively.
- WeLearn web-app, and extension are now available in English, French, and
  Hindi. If you speak another language, and would like to help translate
  WeLearn, let us know!

[email]: mailto:welearn@cri-paris.org
[homepage]: https://welearn.cri-paris.org
