## General Design Considerations
Here’s when and why we use radio button groups:
* Used to group a set of checkable buttons, known as radio buttons, where only one button may be in a checked state (i.e., selected state).
* Radio button groups or radio groups, may look like a group of traditional radio buttons, or may look like a group of items that users switch between. In PhET simulations the radio button themselves may appear more like objects or buttons rather than a traditional radio button with a label and selectable circle input. 
* Radio button groups in PhET Simulations start with a radio button selected (I have not found one that does not).

## Aesthetic Considerations
* Label text - is succinct and hopefully sounds good when read together with "selected". For example, in Area Model, the first Area Grid Size radio button, might sound like, "10 by 10, selected". In Balloons and Static Electricity, user may hear, "Show all charges, selected".
* Focus highlight - light focus around group, thicker pink focus around selected item.

## Accessibility Considerations
* The following information is useful for fully communicating the interaction in the non-visual experience.  
  * the name of the radio button in the group that has focus,
  * the state (checked or not checked) of the radio button,
  * the fact that button is in a radiogroup, or in a radio button list,
  * the name of the group, and
  * the number of buttons or options in the group, 
* It is important for a designer to consider upfront if the group's name should be part of the heading outline of the simulation or not. Placing the group's name in the headig outline (Sample HTML 1) gives the group's name more visibility (findability) in the non-visual experience.

### Special Note 
* Using either a `div` or `fieldset` as the containing parent with the `role="radiogroup"` provides similar experiences. Note that we still need to test in NVDA and JAWS to confirm that `fieldset` it the best parent container.

### Gesture Support
* ToDo


### Keyboard Support
From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)
| Key | Function |
| --- | -------- |
| Tab | Moves focus to the radio group focus is set to the checked `radio` button. (PhET radio group's generally have a pre-selected radio button). If a radio button is not checked, focus moves to the first radio button in the group. PhET Focus Highlight: Keyboard focus highlight goes on the radio button, and a group focus highlight goes on the group. |
| Space | If the `radio` button with focus is not checked, changes the state to `checked`. Otherwise, does nothing. **Note:** The state where a radio button is not checked only occurs on page load. (Unlikely, for PhET as radio button groups always have a radio button pre-selected.) |
| Right arrow, Down arrow | Move focus to and check the next radio button in the group. If focus is on the last radio button, focus moves to the first radio button in the group. The state of the previously checked radio button is changed to unchecked.|
| Left arrow, Up arrow | Move focus to and check the previous radio button in the group. If focus is on the first radio button, moves focus to and checks the last radio button. The state of the previously checked radio button is changed to unchecked. |

From: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

### Management of Roles, States, Properties, and Focus (DRAFT)
Content adpated from: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

| Role | Attribute | Element | Usage |
| radiogroup |-------------| fieldset |
    * Identifies the `fieldset` element as a container for a group of `radio` buttons.
    * Is not focusable because focus is managed using a roving tabindex strategy as described below. (??) |
| ------------- |aria-labelledby="[IDREF"| h3 (or heading) | Refers to the element that contains the label of the radio group. The `legend` element provides the group's name implicitly without `aria-labelledby`.|
| ------------- |tabindex="0"| `ul` |
    * Includes the radio group in the page Tab sequence.
    * Applied to the radio group because `aria--activedescendant` is used to manage focus as described below. ??How are we managing focus?? |
| ------------- |aria-activedescendant="[IDREF]"| `ul` | * When a radio button in the radio group is visually indicated as having keyboard focus, refers to that radio button.
* When arrow keys are pressed, the JavaScript changes the value.
* Enables assistive technologies to know which element the application regards as focused while DOM focus remains on the radio group element.
* For more information about this focus management technique, see [Using aria-activedescendant to Manage Focus](https://www.w3.org/TR/wai-aria-practices/#kbd_focus_activedescendant).|
| ------------- | type="radio" | input  |
    * Identifies the `input` element as an radio button.
    * The accessible name is computed from the child text content of the `label` element.
|
| ------------- |for="[IDREF of input]"| label |* The accessible name for the `radio` is computed from the child text content of the `label` element.|
| ------------- | aria-checked="true", or checked| ------------- |
   * Identifies the radio button which is checked.
   * CSS attribute selectors (e.g. [aria-checked="true"]) are used to synchronize the visual states with the value of the aria-checked attribute. (N/A in PhET's case)
   * The CSS ::before pseudo-class is used to indicate visual state of checked radio buttons to support high contrast settings in operating systems and browsers. (N/A in PhET's case)
|

### Sample 1 HTML when heading semantics are needed  
#### From Balloons and Static Electricity
Example is based on the charge radio buttons in Balloons and Static Electricity. The visual appearence of this groups looks like radio buttons. The paragraph containig help text is placed after the legend in the example.
``` html
<fieldset role="radiogroup" aria-labelledby="rg16-heading">
  <h3 id="rg16-heading">Charge Settings</h3>
   <p>Choose how you see or hear charge information.</p>
    <ul>
      <li><input id="r16-1" type="radio" tabindex="0" checked>
		  <label for="r16-1">Show all charges</label>
      </li>
      <li><input id="r16-2" type="radio">
		  <label for="r16-2">Show no charges</label>
      </li>
     <li><input id="r16-3" type="radio">
		 <label for="r16-3">Show charge differences</label>
      </li>
    </ul>
</fieldset>
```
### Sample 2 HTML no heading semantics
#### From Area Model Introduction
Example is based on the _scene seletion_ radio buttons in Area Model Introduction. The visual appearence of PhET's scene selection buttons is more like small buttons than traditional radio buttons. There is no help text content for this example. By using a legend element instead of a heading element to name the group, the group's name will not be placed in the heading outline of the simulation.
```html
<fieldset role="radiogroup">
  <legend>Area Grid Size</legend>
    <ul id="group-r18">
      <li>
        <input id="r18-1" type="radio" checked tabindex="0">
        <label for="r18-1">10 by 10</label>
      </li>
      <li id="container-r10-2">
        <input id="r18-2" type="radio">
        <label for="r18-2">12 by 12</label>
      </li>
    </ul>
</fieldset>
```

### Supporting Accessibility Resources
* Adapted from [ARIA Practices ??](??)

### Design Doc Content Template Text 
**Radio Button Group**
Group Name via `h3` with `aria-labelledby`: (e.g. Sample 1) OR
Group Name via legend: (e.g. Sample 2)  
Radio group: `fieldset` with `role="radiogroup"`
Radio buttons contained in an `ul` with list items, `li`
List names for radio buttons in the group
- List Item 1 (e.g. 10 by 10)
- List Item 2 (e.g. 12 by 12)
Or as listed in simulation

(Optional) Help Text: 