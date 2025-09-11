---
title: Checkbox
category: other-ui
---

## Checkbox
### Description Options for Checkbox:
    * accessibleName
    * accessibleHelpText
    * accessibleContextResponseChecked
    * accessibleContextResponseUnchecked

### Voicing Options for Checkbox:
    * voicingeNameResponse
    * voicingHelpTextResponse
    * voicingContextResponseChecked
    * voicingContextResponseUnchecked

## Description Design Tips for Core and full Interactive Description

* Checkbox is a simple UI component that should/can be made fully accessible duiring the Core Description design phase.
* SceneryStack code creates an HTML element with the native role of "checkbox," so role information is needed in the design doc.
* Two native states, "checked" and "unchecked," come for free, and are communicated automatically when using alterantive input and screen reader software.
* Alterantive Input also comes for free with a native HMTL checkbox. The Space key toggles the checkbox when it has keyboard focus.

### Description Desgin Tips for Checkbox  
#### accessibleName for CheckBox
* Must be unique.
* Use visual name (if one exits).
* Clearly capture what the checkbox controls (e.g., "Solution Values" is a better name than "Values" alone). Reasoning: The word, "Values" alone, can be vague without context.
* Should not start with a verb (e.g., "Solution Values" is a better name than "Show Values"). Reasoning: A verb works well for the Interactive Descripton feature where changes in state are communicated automatically on focus. A verb in the name works less well for the Voicing feature where the Voicing Name Response can be voiced on its own, without the Voicing Context Responses, and there are no automatic "checked" or "unchecked" states announced.

#### accessibleHelpText
* Capture the idea of the two states in the help text (e.g., "Explore with or without units visible."). Reasoning: This allows for re-use in the Voicing System.
* Should always read as true, regardless of checked state.
* Use help text to add implicit scaffolds for learners. E.g., help them understand why would it be a good idea to toggle this checkbox. 

#### Interactive Description (Full)
* A checkbox should get all the description pieces it needs to be fully accessible during the _Core Description_ design phase.
* When designing additional State and Responsive descriptions for a fully described experience, iterations may be needed to keep the descriptions consistent across the full design. 

## How a Checkbox is Communicated with Screen Reader Software
Screen readers vary in how they read out information. Generally, on focus a screen reader will readout the designed accessible name, the checked state, and the role, "checkbox".
* [accessibleName] + "checked" + "checkbox"
* [accessibleName] + "unchecked" + "checkbox"

When toggled, screen readers may still vary in what they say, but generally they will automatically communicate the new checked state and then the designed accessContextResponse. They generally do not repeat the accessible name.
* "checked" + [accessibleContextResponse describing what happens upon checking.]
* "unchecked" + [accessibleContextResponse describing what happens upon unchecking.].

### Checkbox Design Examples
#### Greenhouse Effect: 
![alt text "Cloud checkbox in Greenhouse Effecy in checked state."](images/ghe-checkbox-cloud.png "Cloud, checked, checkbox")

    * Accessible name: "Cloud"
    * Accessible help text: "Experiment with or without a cloudy sky."
    * Initial state: checked
    * Accessible context response unchecked: "Cloud removed from sky."
    * Accessible context response checked: "Cloud added to sky."

##### What a learner hears when interacting with the Cloud checkbox:
    * On focus: "Cloud, checked, checkbox"
    * When toggled to unchecked: "unchecked", then "Cloud removed from sky."
    * When toggled to checked: "checked", then "Cloud added to sky."

#### Trig Tour: 
![alt text "Special Angles checkbox in Trig Tour in unchecked state."](images/tt-checkbox-specialAngles.png "Special Angles, unchecked, checkbox")

    * Accessible name: Special Angles
    * Accessible help text: Explore with or without constrained angles.
    * Initial state: unchecked
    * Accessible context response checked: "Point on circle contrained to special angles."
    * Accessible context response unchecked: "Point on Circle no longer condtrained."

##### What a learner hears when interacting with the Special Angles checkbox: 
    * On focus: "Special Angles, unchecked, checkbox"
    * When toggled to checked: "checked", then "Point on circle contrained to special angles."
    * When toggled to unchecked: "unchecked", then "Point on Circle no longer condtrained."

## Considerations for Voicing Design (Core and Voicing)
ToDo - do we need considerations for a checkbox, or general voicing considerations?

### Core Voicing:
* Voicing Name Response - always optional, must be unique, and ideally identical to the accessible name and the visually displayed name;
* Voicing Help Text Response - must indicate there are two available states like the examples above. 
* 2 Voicing Context Responses - ideally identical to the accessible context responses confirming what happens upon checking or unchecking the checkbox.

### Voicing
* A checkbox should get all the Voicing Response pieces it needs to be fully voice-able (see above) during the _Core Description_ design phase.
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
Checkbox operation with Alterantive Input should be identical across Description and Voicing features.

| Key   | Function                                               |
|:------|:-------------------------------------------------------|
| Tab or Shift + Tab  | Moves keyboard focus to a checkbox.     |
| Space | Toggles a checkbox between checked and unchecked states. |

## Keyboard Shortcuts Dialog
* Checkbox operation is covered by Basics Actions section of the Keyboard Shorcuts dialog.

## Gesture Support
* Swipe left or right to move focus.
* Double tap to toggle state of checkbox.

## Supporting Resources for Design and Development
* ToDo - Add links to releveant design resources available in the description design course.
* ToDo - Link to a general About Voicing Feature resource.
* ToDo - Link to Core Description Design Guide and API Quick Start Guides
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

### Visaul Checkboxes
* Appear checked or not checked on simulation load.
* Appear with a text-based label, or an icon as the label, or a combination of both text and icon.
* Title case is used for text-based labels for checkboxes.
 

