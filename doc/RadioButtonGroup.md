---
components: [ VerticalAquaRadioButtonGroup, RectangularRadioButtonGroup ]
title: Radio Button Groups
category: other-ui
---

## Design Considerations

We generally use radiobuttons in simulation design:

* To group a set of mutually exclusive options, where only one option in the group can be
  in a selected state. The options are represented as radio buttons.
* Radio button groups, may look like a group of traditional radio buttons, or may look like a group of items that users switch between.
* In PhET sims, traditional-looking groups of radio buttons are refered to as "vertical aqua radio buttons", and have a corresponding look.
* All other groups of radio buttons are generally made up of rectangular buttons with images or symbols. Their size,
  image style, and spacing visually group the individual radio buttons.

**Note this design pattern covers multiple PhET Component Types**

* [RectangularRadioButtonGroup.ts](https://github.com/phetsims/sun/blob/main/js/buttons/RectangularRadioButtonGroup.ts) (
  rectangular radio buttons)
* [VerticalAquaRadioButtonGroup.ts](../js/VerticalAquaRadioButtonGroup.ts) (radio buttons with the macOS Aqua look)

## Aesthetic Considerations

* Label text is succinct and ideally sounds good when read as "selected". For example, in Area Model, the first Area
  Grid Size radio button might sound like, "10 by 10, selected". In Balloons and Static Electricity, a user may hear, "
  Show all charges, selected".
* Occasionally a small icon follows the label text.
* Radio buttons generally show the selected button as fully opaque with a thick black stroke, and the unselected buttons
  have reduced opacity and a thin stroke.
* Interactive highlight and focus highlight have a light pink focus around the group, and a thicker pink focus around the selected radio button.

## Considerations for Description Design (Core and Interactive Description)

* SceneryStack code creates an accessible radio button group using native HTML components and structires. The individual radio buttons are grouped within list items and the accessible name for the group is provided by a programmatically associated heading.
* Radio groups communicate several pieces of information systematically,
   * Accessible names for each radio button
   * The selected state of each radio button
   * The radiobutton's position within the group, and
   * The accessible name for the group name.
* Generally, radiobutton groups are simple UI components that can be made fully accessible with Core Description. However, there are cases where special context responses may be needed and may be out of scope for Core Description. 

### Requred descriptions:
* Accessible Name for the group -  must be unique; may not be visually displayed;
* Accessible Name for each radio button - must be unique;
* Accessible Help Text - worded to implicitly guide the learner as to the purpose of the radiobuttons;

### Gesture Support

* Swipe left or right to move focus.
* Double tap to toggle the state of the radiobutton.


### Keyboard Support

From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

| Key                     | Function                                                                                                                                                                                                                                                                                                                                         |
|:------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Tab                     | Moves focus to the radio group and focus is set to the selected `radio` button. (PhET radio group's generally have a pre-selected radio button). If a radio button is not selected, focus moves to the first radio button in the group. PhET's keyboard focus highlight goes on the radio button, and a group focus highlight goes on the group. |
| Space                   | If the `radio` button with focus is not selected, it changes the state to selected. Otherwise, does nothing. **Note:** The state where a radio button is not selected only occurs on page load. (**Note:** a radio button button group starting without a pre-selected radio buton is unlikely for a PhET Sim.)                                  |
| Right arrow, Down arrow | Moves focus to and selects the next radio button in the group. If focus is on the last radio button, focus moves to the first radio button in the group. The state of the previously selected radio button is changed to unchecked.                                                                                                              |
| Left arrow, Up arrow    | Moves focus to and selects the previous radio button in the group. If focus is on the first radio button, moves focus to and selects the last radio button. The state of the previously selected radio button is changed to unselected.                                                                                                          |

From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)
                                                                                                            |

### Examples

#### Molecules and Light (rectangular radio buttons)
- Accessible Name for the radiogroup : Light Sources
- Radiobuttons:
  - Accessible Name: Microwave
  - Accessible Name: Infared (selected)
  - Accessible Name: Visible
  - Accessible Name: Ultraviolet
- Accessible Help Text: Choose light source for observation window ordered low to high energy.

#### Balloons and Static Electricity Example
- Accessible Name for the radiogroup : Null because the group is part of larger group of controls under an Accessible Heading.
- Radiobuttons:
  - Accessible Name: Show all charges. (selected)
  - Accessible Name: Show no charges.
  - Accessible Name: SHow charge differences
  - Accessible Name: Ultraviolet
- Accessible Help Text: Null because the button names clearly communicate the options.

### Supporting Accessibility Resources

* [ARIA 1.1 radiogroup role](https://www.w3.org/TR/wai-aria-1.1/#radiogroup)
* [ARIA 1.1 radio role](https://www.w3.org/TR/wai-aria-1.1/#radio)
* Adapted techncal notes
  from [ARIA Practices 1.1, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices-1.1/#radiobutton)
* ARIA Example
  1 [Radio Group using Roving Tab Index](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-1/radio-1.html)
* ARIA Example
  2 [Radio Group Example Using aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-2/radio-2.html)



