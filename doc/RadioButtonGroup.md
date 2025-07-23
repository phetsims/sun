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

### Sample 1 HTML with heading &amp; aria-labelledby (heading semantics required)

#### Moleules and Light Example

Example is based on the light sources radio buttons in _Molecules and Light_. The visual appearance of these buttons are
large square buttons with flashlight-like icons, rather than traditional radio buttons with text-based labels. The
paragraph containig help text is placed after the h3 heading in this example.

``` html
<fieldset role="radiogroup" aria-labelledby="rg16-heading">
  <h3 id="rg16-heading">Light Sources</h3>
   <p>Change light source in observation window.</p>
    <ul>
      <li><input id="r16-1" type="radio" tabindex="0" checked>
		  <label for="r16-1">Microwave</label>
      </li>
      <li><input id="r16-2" type="radio">
		  <label for="r16-2">Infared</label>
      </li>
     <li><input id="r16-3" type="radio">
		 <label for="r16-3">Visible</label>
      </li>
      <li><input id="r16-4" type="radio">
 		 <label for="r16-4">Ultraviolet</label>
       </li>
    </ul>
</fieldset>
```

### Sample 2 HTML with legend (heading semantics not required)

#### Area Model Introduction Example

Example is based on the "scene selection" radio buttons in _Area Model Introduction_. The visual appearence of these
buttons small square buttons, rather than traditional radio buttons. There is no help text content for this example. By
using a legend element instead of a heading element to name the group, the group's name will not be placed in the
heading outline of the simulation. The `aria-labelledby` attribute is not needed with the `legend` element.

``` html
<fieldset role="radiogroup">
  <legend>Area Grid Size</legend>
    <ul id="group-r18">
      <li>
        <input id="r18-1" type="radio" tabindex="0" checked>
        <label for="r18-1">10 by 10</label>
      </li>
      <li id="container-r10-2">
        <input id="r18-2" type="radio">
        <label for="r18-2">12 by 12</label>
      </li>
    </ul>
</fieldset>
```

### Sample 3 HTML early simple solution with no ARIA

#### Balloons and Static Electricity Example

Example is based on the charge radio buttons in Balloons and Static Electricity. The visual appearence of this group
looks like radio buttons. The paragraph containig help text is placed after the h3 heading in this example.

**Note** This simple structure does not use any aria roles or attributes. Early usability testing (2015-2016) found
simple was better. AT for `fieldset`, `role="radiogroup"`, and `aria-labelledby` has improved since early testing with
this simulation, so we are moving forward with the `fieldset` examples above.

``` html
<div id-"rgroup-container-id">
  <h3 id="rgroup-label-id">Charge Settings</h3>
   <p>Choose how you see or hear charge information.</p>
    <ul>
      <li><input id="radiobutton-1" tabindex="0" type="radio" checked>
		  <label for="radiobutton-1">Show all charges</label>
      </li>
      <li><input id="radiobutton-2" type="radio">
		  <label for="radiobutton-2">Show no charges</label>
      </li>
     <li><input id="radiobutton-3" type="radio">
		 <label for="radiobutton-3">Show charge differences</label>
      </li>
    </ul>
</div>
```

### Supporting Accessibility Resources

* [ARIA 1.1 radiogroup role](https://www.w3.org/TR/wai-aria-1.1/#radiogroup)
* [ARIA 1.1 radio role](https://www.w3.org/TR/wai-aria-1.1/#radio)
* Adapted techncal notes
  from [ARIA Practices 1.1, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices-1.1/#radiobutton)
* ARIA Example
  1 [Radio Group using Roving Tab Index](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-1/radio-1.html)
* ARIA Example
  2 [Radio Group Example Using aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-2/radio-2.html)

### Design Doc Content Template Text

**Light Sources, Radio Button Group**

- PhET Component: RectangularRadioButtonGroup.ts
- Group Name via `h3` with `aria-labelledby`: Light Sources (e.g. Sample 1)
- Radio button group: `fieldset` with `role="radiogroup"`
- Radio buttons contained in an `ul` with list items, `li`
- Names for radio buttons in the group
  - List Item 1: Name (e.g. Microwave)
  - List Item 2: Name (e.g. Infared)
  - List Item 3: Name (e.g. Visible)
  - List Item 4: Name (e.g. Ultraviolet)
  - Or as listed in simulation
- (Optional) Help Text: (e.g. Change light source in observation window.)

**Area Grid Size, Radio Button Group**

- PhET Component: RectangularRadioButtonGroup.ts
- Group Name via `legend`: Area Grid Size (e.g. Sample 2)
- Radio button group: `fieldset` with `role="radiogroup"`
- Radio buttons contained in an `ul` with list items, `li`
- List names for radio buttons in the group
  - List Item 1: Name (e.g. 10 by 10)
  - List Item 2: Name (e.g. 12 by 12)
  - Or as listed in simulation
- (Optional) Help Text:
