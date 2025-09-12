---
title: Checkbox
category: other-ui
---

## Checkbox
* Checkbox is a simple UI component that is required to be made fully accessible during the Core Description design phase.
* Role information comes for free because SceneryStack code automatically creates an HTML element with the native role of "checkbox." Designers do not need to put role information in the design doc when designing descriptions for a checkbox.
* Two native states, "checked" and "unchecked," also come for free. State and state changes are communicated automatically on focus and on interaction.
* Alternative Input comes for free, too. The Space key toggles the checkbox when it has keyboard focus.
  
### Description Options for Checkbox:
    * accessibleName
    * accessibleHelpText
    * accessibleContextResponseChecked
    * accessibleContextResponseUnchecked
    * Intial state:

### Voicing Options for Checkbox:
    * voicingeNameResponse
    * voicingHelpTextResponse
    * voicingContextResponseChecked
    * voicingContextResponseUnchecked

### Description Design Tips for Checkbox 
#### accessibleName
* Be sure to create a unique name. The name ideally matches the visual name when one exists.
* Clearly capture what the checkbox controls (e.g., "Solution Values" is a better name than "Values" alone). Reasoning: The word, "Values" alone, can be vague without additional context.
* Avoid using a verb (e.g., "Solution Values" is a better name than "Show Values"). Reasoning: A verb works well for the Interactive Description feature where the checked state and changes in state are always communicated. A verb in the name works less well for the Voicing feature where the Voicing Name Response can be voiced on its own, without a voicing context response, and where there are no automatic "checked" or "unchecked" states announced.
* Use title case for names.

#### accessibleHelpText
* Capture the idea of the two states in the help text (e.g., "Explore with or without units visible."). Reasoning: This allows for re-use in the Voicing System.
* Ensure it always reads as true, regardless of checked state.
* Use help text to add implicit scaffolds for learners. (e.g., help them understand why it might be a good idea to toggle this checkbox).
* Use sentence case for help text.

#### accessibleContextResponseChecked and Unchecked
The surrounding context changes that happen when toggling a checkbox are generally pretty simple.
* accessibleContextResponseChecked captures what happens when the checkbox is toggled to a checked state. Do not include "checked" as that comes for free.
* accessibleContextResponseUnchecked captures happens when the checkbox is toggled to an unchecked state. Again, do not include "unchecked."
* Use sentence case for help text.

## How a Checkbox is Communicated with Screen Reader Software
Screen readers vary in how they read out information. Generally, when keyboard focus is moved to a checkbox the screen reader will read out the designed accessible name, the checked state ("checked" or "unchecked"), and the role, "checkbox". 
* [accessibleName] + "checked" + "checkbox"
* [accessibleName] + "unchecked" + "checkbox"

When toggled, screen readers may still vary in what they say, but generally they will automatically communicate the new checked state and then deliver the designed accessibleContextResponse. They generally do not repeat the accessible name.
* "checked" + [accessibleContextResponse describing what happens upon checking.]
* "unchecked" + [accessibleContextResponse describing what happens upon unchecking.].

The accessible help text is accessed on-demand by the learner when reading descriptions with cursor keys. 

### Checkbox Design Examples
#### Greenhouse Effect: 
![alt text "Cloud checkbox in Greenhouse Effect in checked state."](images/ghe-checkbox-cloud.png "Cloud, checked, checkbox")

    * accessibleName: Cloud
    * accessibleHelpText: Experiment with or without a cloudy sky.
    * accessibleContextResponseUnchecked: Cloud removed from sky.
    * accessibleContextResponseChecked: Cloud added to sky.
    * Initial state: checked

##### What a learner hears when interacting with the Cloud checkbox:
    * On focus: "Cloud, checked, checkbox"
    * When toggled to unchecked: "unchecked", then "Cloud removed from sky."
    * When toggled to checked: "checked", then "Cloud added to sky."

#### Trig Tour: 
![alt text "Special Angles checkbox in Trig Tour in unchecked state."](images/tt-checkbox-specialAngles.png "Special Angles, unchecked, checkbox")

    * accessibleName: Special Angles
    * accessibleHelpText: Explore with or without constrained angles.
    * accessibleContextResponseChecked: Point on circle constrained to special angles.
    * accessibleContextResponseUnchecked: Point on Circle no longer constrained.
    * Initial state: unchecked

##### What a learner hears when interacting with the Special Angles checkbox: 
    * On focus: "Special Angles, unchecked, checkbox"
    * When toggled to checked: "checked", then "Point on circle constrained to special angles."
    * When toggled to unchecked: "unchecked", then "Point on Circle no longer constrained."

### Design Consideration for Voicing Options
The design tips for Description also apply to Voicing.
* voicingNameResponse - must be unique, and ideally identical to the accessible name and the visual name.
* voicingHelpTextResponse - must indicate there are two available states like the examples above. 
* voicingContextResponseChecked = accessibleContextResponseChecked
* voicingContextResponseUnchecked = accessibleContextResponseUchecked

### Voicing
* A checkbox should get all the Voicing Response options it needs to be fully voice-able (see above) during the _Core Description_ design phase.
* Typically, the same descriptions designed for _Core/Interactive Description_ can be used as-is for checkbox voicing responses. Options are available to make them different, if needed. 

#### How a Checkbox Sounds with the Voicing Feature 
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
 
## Keyboard Support
Checkbox operation with Alternative Input should be identical across Description and Voicing features.

| Key   | Function                                               |
|:------|:-------------------------------------------------------|
| Tab or Shift + Tab  | Moves keyboard focus to a checkbox.     |
| Space | Toggles a checkbox between checked and unchecked states. |

## Keyboard Shortcuts Dialog
* Checkbox operation is covered by Basics Actions section of the Keyboard Shortcuts dialog.

## Gesture Support
* Swipe left or right to move focus.
* Double tap to toggle state of checkbox.

## Supporting Resources for Description Design and Development
* ToDo - Add links to relevant design resources available in the description design course.
* ToDo - Link to a general About Voicing Feature resource.
* ToDo - Link to Description Design Guide:Core and API Quick Start Guides
* [ARIA Authoring Practice Guide: Checkbox Example (Two State)](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox/) 
* [Using ARIA, working draft](https://www.w3.org/TR/using-aria/)
* [HTML Living Standard, Section 4.10.5.1.15 Checkbox state (type=checkbox)](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox))
* [ARIA Authoring Practice Guide: Checkbox Example (Two State)](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/examples/checkbox/)

## Other Interaction Design Considerations
We generally use a checkbox in simulation design:

* To toggle on (or off) a secondary or non-essential option;
* To provide a group of options that can be toggled on or off;
* To layer on more complex representations, or to view multiple, related
  represenations simultaneously. More complex options are generally off by default.

### Visual Checkboxes
* Appear checked or not checked on simulation load.
* Appear with a text-based label, or an icon as the label, or a combination of both text and icon.
* Title case is used for text-based labels for checkboxes.
 

