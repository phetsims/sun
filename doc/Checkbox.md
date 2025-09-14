---
title: Checkbox
category: other-ui
---

## Checkbox
We generally use a checkbox in simulation design:

* To toggle on (or off) a secondary or non-essential option;
* To provide a group of options that can be toggled on or off;
* To layer on more complex representations, or to view multiple, related
  represenations simultaneously. More complex options are generally off by default.

### Visual Design Considerations
* Appear checked or not checked on simulation load.
* Appear with a text-based label, or an icon as the label, or a combination of both text and icon.
* Title case is used for text-based labels for checkboxes.

### Design Description Considerations
Checkbox is a simple UI component that is required to be made fully accessible during the Core Description design phase by specifying/defining/designing the options that are not already built in.

#### Built-in options:
* Role: ‘checkbox’
* accessibleObjectResponse: ‘checked,’ ‘unchecked’

#### Options needed for Core/Interactive Description:
    accessibleName:
    accessibleHelpText:
    accessibleContextResponseChecked:
    accessibleContextResponseUnchecked:

#### Additional information:
* Initial state: checked or unchecked

### Description Design How-To 
#### accessibleName
* Must be unique.
* Matches visual name when exists.
* Capture what checkbox controls (e.g., "Solution Values" is a better name than "Values" alone). 
  * Reasoning: The word, "Values" alone, can be vague without additional context.
* Avoid using a verb (e.g., "Solution Values" is a better name than "Show Values"). 
  * Reasoning: A verb works well for the Interactive Description feature where the checked state and changes in state are always communicated. A verb in the name works less well for the Voicing feature where the Voicing Name Response can be voiced on its own, without a voicing context response, and where there are no automatic object responses about checked state are announced.
* Uses title case, generally no punctuation. E.g., no period at the end.

#### accessibleHelpText
* Always reads as true, regardless of checked state (e.g., “Show or hide…” or “Explore with or without…”)
* Adds implicit scaffolds for learners. (e.g., help them understand the purpose of the checkbox).
* Uses sentence case with punctuation.

#### accessibleContextResponseChecked and Unchecked
The surrounding changes that happen when toggling a checkbox are generally simple, but there are cases (see Constant Size checkbox in Gravity Force Lab: Basics) where certain conditions in the simulation can cause model changes that need to be accounted for in the context response. _*Tip/Strategy:*_ Design 2 responses, then watch for cases where these responses are incorrect or missing a detail that could interfere with sensemaking._ 
* accessibleContextResponseChecked captures what happens when the checkbox is toggled to a checked state. Do not include "checked."
* accessibleContextResponseUnchecked captures what happens when the checkbox is toggled to an unchecked state. Again, do not include "unchecked."
* Uses sentence case with punctuation.

## How a Checkbox is Communicated with Screen Reader Software
Screen readers vary in how they read out information. Generally, the screen reader will announce the following information on keyboard focus and then upon interaction.

On focus designed name, built-in object response and role:
* [accessibleName] + "checked" + "checkbox"
* [accessibleName] + "unchecked" + "checkbox"

Upon toggling, built-in object response and designed context response (no repeat of name): 
* "checked" + [accessibleContextResponseChecked]
* "unchecked" + [accessibleContextResponseUnchecked].

Additionally, since the accessibleHelpText is not focusable, it is accessed on-demand by the user when they read through the descriptions with cursor keys.

## Checkbox Design Examples
### Greenhouse Effect: 
![alt text "Cloud checkbox in Greenhouse Effect in checked state."](images/ghe-checkbox-cloud.png "Cloud, checked, checkbox")

    accessibleName: Cloud
    accessibleHelpText: Experiment with or without a cloudy sky.
    accessibleContextResponseUnchecked: Cloud removed from sky.
    accessibleContextResponseChecked: Cloud added to sky.
    Initial state: checked

#### What a learner hears when interacting with the Cloud checkbox:
* On focus: "Cloud, checked, checkbox"
* When toggled to unchecked: "unchecked", then "Cloud removed from sky."
* When toggled to checked: "checked", then "Cloud added to sky."

### Trig Tour: 
![alt text "Special Angles checkbox in Trig Tour in unchecked state."](images/tt-checkbox-specialAngles.png "Special Angles, unchecked, checkbox")

    accessibleName: Special Angles
    accessibleHelpText: Explore with or without constrained angles.
    accessibleContextResponseChecked: Point on circle constrained to special angles.
    accessibleContextResponseUnchecked: Point on Circle no longer constrained.
    Initial state: unchecked

#### What a learner hears when interacting with the Special Angles checkbox: 
* On focus: "Special Angles, unchecked, checkbox"
* When toggled to checked: "checked", then "Point on circle constrained to special angles."
* When toggled to unchecked: "unchecked", then "Point on Circle no longer constrained."

### Voicing Design Considerations
In the Voicing experience, the “built-in description options” are not announced, and voicingHelpText is only available to learners who use the keyboard.

Voicing Options to specify/define/design:
    voicingeNameResponse:
    voicingHelpTextResponse:
    voicingContextResponseChecked:
    voicingContextResponseUnchecked:

#### Voicing Design How-To
The same description design tips apply to the design of voicing responses. Typically, for Checkbox, the same descriptions designed for Core/Interactive Description can be used as-is for the voicing responses. Options are available to make them different, if needed.

* voicingNameResponse - must be unique, and ideally identical to the accessible name and the visual name.
* voicingHelpTextResponse - must indicate there are two available states like the examples above.
* voicingContextResponseChecked - should be identical to accessibleContextResponseChecked
* voicingContextResponseUnchecked - should be identical to accessibleContextResponseUchecked

#### How a Checkbox is Communicated with the Voicing Feature 
The experience of a checkbox varies based on input method and the Sim Voicing Options currently selected in Preferences. 
* With keyboard input, users: 
    * Always hear voicing name response;
    * Can hear a voicing help text response; 
    * Never hear changed states, "checked" or "unchecked";
    * Can hear a voicing context response.
* With mouse and touch users: 
    * Always hear voicing name response;
    * Never hear voicing help text response;
    * Never hear changed states, "checked" or "unchecked";
    * Can hear a voicing context response.
 
## Alternative Input (Keyboard Support)
Keyboard operation of Checkbox should be identical across Description and Voicing features.

| Key   | Function                                               |
|:------|:-------------------------------------------------------|
| Tab or Shift + Tab  | Moves keyboard focus to a checkbox.     |
| Space | Toggles a checkbox between checked and unchecked states. |

### Keyboard Shortcuts Dialog
* Checkbox operation is covered by Basics Actions section of the Keyboard Shortcuts dialog.

## Gesture Support
* Swipe left or right to move focus.
* Double tap to toggle state of checkbox.

## Supporting Resources for Description Design and Development
* ToDo - Link to Description Design Guide:Core and API Quick Start Guides
* ToDo - Link to a general About Voicing Feature resource.
* ToDo - Link to relevant resources in Description Course
* ToDo - W3C Web Accessibility Initiative


