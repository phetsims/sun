---
components: [ VerticalAquaRadioButtonGroup, RadioButtonGroup ]
title: Radio Button Groups
category: other-ui
---

## General Design Considerations
Here’s when and why we use radio button groups:
* Used to group a set of mutually exclusive buttons, known as radio buttons, where only one button in the group may be in a selected state.
* Radio button groups, may look like a group of traditional radio buttons, or may look like a group of items that users switch between.
* In PhET sims, traditional-looking groups of radio buttons are refered to as "vertical aqua radio buttons", and have a corresponding look.
* All other groups of radio buttons are generally made up of rectangular buttons with images or symbols. Their size, image style, and spacing are visually group the individual radio buttons.

**Note this design pattern covers multiple PhET Component Types**
* [RadioButtonGroup.js](https://github.com/phetsims/sun/blob/master/js/buttons/RadioButtonGroup.js) (non-traditional looking radio buttons)
* [VerticalAquaRadioButtonGroup.js](../js/VerticalAquaRadioButtonGroup.js) (a convenient type style to display traditional-looking radio groups)

## Aesthetic Considerations
* Label text is succinct and ideally sounds good when read as "selected". For example, in Area Model, the first Area Grid Size radio button might sound like, "10 by 10, selected". In Balloons and Static Electricity, a user may hear, "Show all charges, selected".
* Occasionally a small icon follows the label text.
* Radio buttons generally show the selected button as fully opaque with a thick black stroke, and the unselected buttons have reduced opacity and a thin stroke.
* Focus highlight has a light focus around the group, and a thicker pink focus around the selected item.

## Accessibility Considerations
* The following information is useful for fully communicating the interaction in the non-visual experience.  
  * the name of the radio button in the group that has focus,
  * the state (selected or not selected) of the radio button,
  * the fact that button is in a radiogroup, or in a radio button list,
  * the name of the group, and
  * the number of buttons or options in the group,
* It is important for a designer to consider upfront if the group's name should be part of the heading outline of the simulation or not. Placing the group's name in the heading outline (Sample HTML 1) gives the group's name more visibility (e.g., findability) in the non-visual experience. If that visibility is not necessary, you could use a `legend` element (Sample HTML 2).

### Special Notes and Questions
* Using either a `div` or `fieldset` as the containing parent with the `role="radiogroup"` provides similar experiences. Note that we still need to test in NVDA and JAWS to confirm that `fieldset` is the best parent container.
* **Note** the HTML is different from the ARIA Practices Examples because it uses more native HTML. The ARIA Examples, however, sound slightly better, consistently reading out radiogroup role and radio count without any duplicate list semantics. I'm not sure if the ARIA examples require heavier explicit handling of keyboard support because they do not use native form elements?
### Gesture Support
* ToDo


### Keyboard Support
From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

| Key   | Function |
| :---- | :------- |
| Tab | Moves focus to the radio group and focus is set to the selected `radio` button. (PhET radio group's generally have a pre-selected radio button). If a radio button is not selected, focus moves to the first radio button in the group. PhET's keyboard focus highlight goes on the radio button, and a group focus highlight goes on the group. |
| Space | If the `radio` button with focus is not selected, it changes the state to selected. Otherwise, does nothing. **Note:** The state where a radio button is not selected only occurs on page load. (**Note:** a radio button button group starting without a pre-selected radio buton is unlikely for a PhET Sim.) |
| Right arrow, Down arrow | Moves focus to and selects the next radio button in the group. If focus is on the last radio button, focus moves to the first radio button in the group. The state of the previously selected radio button is changed to unchecked.|
| Left arrow, Up arrow | Moves focus to and selects the previous radio button in the group. If focus is on the first radio button, moves focus to and selects the last radio button. The state of the previously selected radio button is changed to unselected. |

From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

### Management of Roles, States, Properties, and Focus (DRAFT)
Content adpated from: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)


| Role | Attribute | Element | Usage |
|:---- | :-------- | :------ | :---- |
| radiogroup |  | fieldset | Identifies the `fieldset` element as a container for a group of `radio` buttons. Group is not focusable because focus is managed using a roving tabindex strategy as described below. (**Question:** How are we managing focus?) |
|  | `aria-labelledby="[IDREF"` | `h3` (heading with appropriate heading level) | Refers to the element that contains the label of the radio group. The `legend` element can be used instead of a heading, and would provide the group's name implicitly without `aria-labelledby`. Note, however, the `legend` element is not included in the heading outline for screen readers.|
|  | `tabindex="0"` | `ul` | Includes the radio group in the page Tab sequence. Applied to the radio group because `aria-activedescendant` is used to manage focus as described below. (**Question:** How are we managing focus?) |
|  | `aria-activedescendant="[IDREF]"` | `ul` | When a radio button in the radio group is visually indicated as having keyboard focus, refers to that radio button. When arrow keys are pressed, the JavaScript changes the value. Enables assistive technologies to know which element the application regards as focused while DOM focus remains on the radio group element. For more information about this focus management technique, see [Using aria-activedescendant to Manage Focus](https://www.w3.org/TR/wai-aria-practices/#kbd_focus_activedescendant).|
|  | `type="radio"` | `input`  | Identifies the `input` element as a radio button. The accessible name is computed from the child text content of the `label` element. |
|  | `for="[IDREF of input]"` | label | The accessible name for the `radio` is computed from the child text content of the `label` element.|
|  | `aria-checked="true"`, or `checked` (**Question:** Do we use the aria attribute or the HTML5 attribute currently?) |  | Identifies the radio button which is selected. CSS attribute selectors (e.g. [`aria-checked="true"`]) are used to synchronize the visual states with the value of the `aria-checked` attribute. (N/A in PhET's case) The CSS ::before pseudo-class is used to indicate visual state of selected radio buttons to support high contrast settings in operating systems and browsers. (N/A in PhET's case) |

### Sample 1 HTML with heading &amp; aria-labelledby (heading semantics required)
#### Moleules and Light Example
Example is based on the light sources radio buttons in _Moelcules and Light_. The visual appearence of these buttons are large square buttons with flashlight-like icons, rather than traditional radio buttons with text-based labels. The paragraph containig help text is placed after the h3 heading in this example.
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
Example is based on the "scene selection" radio buttons in _Area Model Introduction_. The visual appearence of these buttons small square buttons, rather than traditional radio buttons. There is no help text content for this example. By using a legend element instead of a heading element to name the group, the group's name will not be placed in the heading outline of the simulation. The `aria-labelledby` attribute is not needed with the `legend` element.
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
Example is based on the charge radio buttons in Balloons and Static Electricity. The visual appearence of this group looks like radio buttons. The paragraph containig help text is placed after the h3 heading in this example.

**Note** This simple structure does not use any aria roles or attributes. Early usability testing (2015-2016) found simple was better. AT for `fieldset`, `role="radiogroup"`, and `aria-labelledby` has improved since early testing with this simulation, so we are moving forward with the `fieldset` examples above.

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
* Adapted techncal notes from [ARIA Practices 1.1, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices-1.1/#radiobutton)
* ARIA Example 1 [Radio Group using Roving Tab Index](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-1/radio-1.html)
* ARIA Example 2 [Radio Group Example Using aria-activedescendant](https://www.w3.org/TR/wai-aria-practices-1.1/examples/radio/radio-2/radio-2.html)

### Design Doc Content Template Text
**Light Sources, Radio Button Group**
- PhET Component: RadioButtonGroup.js
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
- PhET Component: RadioButtonGroup.js
- Group Name via `legend`: Area Grid Size (e.g. Sample 2)  
- Radio button group: `fieldset` with `role="radiogroup"`
- Radio buttons contained in an `ul` with list items, `li`
- List names for radio buttons in the group
  - List Item 1: Name (e.g. 10 by 10)
  - List Item 2: Name (e.g. 12 by 12)
  - Or as listed in simulation
- (Optional) Help Text:
