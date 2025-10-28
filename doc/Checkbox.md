---
title: Checkbox
category: other-ui
---

## Checkbox

We generally use a checkbox interaction in simulation design:

* To toggle on (or off) a secondary or non-essential option;
* To provide a group of options that can be toggled on or off;
* To layer on more complex representations, or to view multiple, related
  represenations simultaneously. More complex options are generally off by default.


### Design Considerations
* Appear checked or not checked on simulation load.
* Appear with a text-based label, or an icon as the label, or a combination of both text and icon.
* Title case is used for text-based labels for checkboxes.

### Description Design Considerations
* Checkbox is a simple UI component.
* Required to be made fully accessible during the _Core Description_ design phase.

#### Built-in Options:
* Role: ‘checkbox’
* accessibleObjectResponse: ‘checked,’ ‘unchecked’

#### Options Needed for _Core Description_ and _Interactive Description:_
    accessibleName:
    accessibleHelpText:
    accessibleContextResponseChecked:
    accessibleContextResponseUnchecked:

    Initial state: checked or unchecked

### Description Design How-To 
#### accessibleName
* Is unique (required).
* Matches visual name when possible.
* Captures what the checkbox controls (e.g., "Solution Values" is a better name than "Values" alone). 
  * Reasoning: The word, "Values" alone, can be vague without additional context.
* Avoids using a verb (e.g., "Solution Values" is a better name than "Show Values"). 
  * Reasoning: A verb works well for the _Interactive Description_ feature where the checked state and changes are always communicated. A verb in the name works less well for the _Voicing_ feature where the *voicingNameResponse* can be voiced on its own, without a *voicingContextResponse.*
* Uses title case; generally no punctuation is needed. E.g., no period at end of name.

#### accessibleHelpText
* Always optional.
* Reads as true, regardless of checked state (e.g., “Show or hide…” or “Explore with or without…”).
* Adds implicit scaffolds for learners (e.g., helps them understand the purpose of the checkbox).
* Uses sentence case with punctuation.

#### accessibleContextResponses- Checked and Unchecked
The surrounding changes that happen when toggling a checkbox are most often binary in nature and generally do not result in diverse model changes. 
* *accessibleContextResponseChecked*: captures what happens when the checkbox is toggled to a checked state. Do not include the word, "checked."
* *accessibleContextResponseUnchecked*: captures what happens when the checkbox is toggled to an unchecked state.
* Uses sentence case with punctuation.

**Note:** Watch out for edge cases where the toggling of a checkbox can produce a model change. For example, the "Constant Size" checkbox in _Gravity Force Lab: Basics_ causes a model change under certain conditions when "Constant Size" in unchecked. _**Strategy:** Design two responses, then watch for cases where these responses are incorrect or do not catch the details needed for sensemaking._ 

### How a Checkbox is Communicated with Screen Reader Software
Screen readers vary in how they read out information. Generally, the screen reader will announce the designed accessible name, state (built-in object response), and role on focus, and then new state and design context response upon toggling the state.

On focus:
* [accessibleName] + "checked" + "checkbox"
* [accessibleName] + "unchecked" + "checkbox"

Upon toggling: 
* "checked" + [accessibleContextResponseChecked]
* "unchecked" + [accessibleContextResponseUnchecked].

Additionally, since the *accessibleHelpText* is not focusable, it is accessed on-demand by the user when they read through the descriptions with their cursor keys. The on-demand nature of access and delivery of help text means, as a designer, you can focus more on the scaffolding and context needs of the interaction rather than solely on brevity. Being brief and succinct is still important, but less important for help text than for the name and the context responses.  

### Checkbox Design Examples
#### Greenhouse Effect: 
![alt text "Cloud checkbox in Greenhouse Effect in checked state."](images/ghe-checkbox-cloud.png "Cloud, checked, checkbox")

    accessibleName: Cloud
    accessibleHelpText: Experiment with or without a cloudy sky.
    accessibleContextResponseUnchecked: Cloud removed from sky.
    accessibleContextResponseChecked: Cloud added to sky.
    Initial state: checked

##### What a user hears when interacting with the Cloud checkbox:
* On focus: "Cloud, checked, checkbox"
* When toggled to unchecked: "unchecked", then "Cloud removed from sky."
* When toggled to checked: "checked", then "Cloud added to sky."

#### Trig Tour: 
![alt text "Special Angles checkbox in Trig Tour in unchecked state."](images/tt-checkbox-specialAngles.png "Special Angles, unchecked, checkbox")

    accessibleName: Special Angles
    accessibleHelpText: Explore with or without constrained angles.
    accessibleContextResponseChecked: Point on circle constrained to special angles.
    accessibleContextResponseUnchecked: Point on Circle no longer constrained.
    Initial state: unchecked

##### What a user hears when interacting with the Special Angles checkbox: 
* On focus: "Special Angles, unchecked, checkbox"
* When toggled to checked: "checked", then "Point on circle constrained to special angles."
* When toggled to unchecked: "unchecked", then "Point on Circle no longer constrained."

### Voicing Design Considerations
In the Voicing experience, the _built-in description options_ are not announced, and the _voicingHelpText_ is only heard on focus for learners who use focus-based Alternative Input.

#### Options needed for Core Voicing and full Voicing:
    voicingeNameResponse:
    voicingHelpTextResponse:
    voicingContextResponseChecked:
    voicingContextResponseUnchecked:

#### Voicing Design How-To
 Typically, for _Checkbox_, the same descriptions designed for _Core/Interactive Description_ can be used as-is for the _Voicing Responses_. Options are available to make them different, if needed. _The same description design tips apply to the design of voicing responses._

* voicingNameResponse - is unique, and ideally identical to the _accessibleName_ and the visually displayed name.
* voicingHelpTextResponse - must indicate there are two available states like the examples above.
* voicingContextResponseChecked - should be identical to _accessibleContextResponseChecked_.
* voicingContextResponseUnchecked - should be identical to _accessibleContextResponseUchecked_.

### How a Checkbox is Communicated with the Voicing Feature 
The _Voicing_ experience of _Checkbox_ varies based on input method and the _Sim Voicing Options_ selected in _Preferences_. 
* With keyboard input, users: 
    * Always hear a voicing name response.
    * Can hear a voicing help text response.
    * Never hear changed states, i.e., "checked" or "unchecked."
    * Can hear a voicing context response.
* With mouse and touch users: 
    * Always hear a voicing name response.
    * Never hear a voicing help text response.
    * Never hear changed states, i.e., "checked" or "unchecked."
    * Can hear a voicing context response.
 
## Alternative Input
| Key   | Function                                               |
|:------|:-------------------------------------------------------|
| Tab or Shift + Tab  | Moves keyboard focus to a checkbox.     |
| Space | Toggles a checkbox between checked and unchecked states. |

* Keyboard operation of _Checkbox_ should be identical across _Description_ and _Voicing_ features.
* Keyboard instructions for _Checkbox_ are covered by the _Basics Action_ section of the _Keyboard Shortcuts_ dialog.

### Gesture Support
* Swipe left or right to move focus to the checkbox.
* Double tap to toggle state of checkbox.

## Supporting Resources for Description Design and Development
* [Description Design Guide: Core](https://docs.google.com/document/d/1kCivjmuXiMzrFkYUigZFgDkssoEWGW_-OaXDk9myV00/edit?tab=t.0#heading=h.rj5etgrq1nf7)
* [Core Description Options](https://github.com/phetsims/phet-info/blob/main/doc/core-description-options.md)
* [Core Description Quick Start Guide](https://github.com/phetsims/phet-info/blob/main/doc/core-description-quickstart-guide.md)
* [Core Voicing Quick Start Guide](https://github.com/phetsims/phet-info/blob/main/doc/core-voicing-quickstart-guide.md)
* [About the Interactive Description Feature](https://phet.colorado.edu/en/inclusive-design/features?section=interactive-description)
* [About the Voicing Feature](https://phet.colorado.edu/en/inclusive-design/features?section=voicing)
* [Interactive Description Design Course (available on Coursera)](https://www.coursera.org/learn/description-design-for-interactive-learning-resources).


