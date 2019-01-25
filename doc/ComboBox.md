---
title: ComboBox
category: other-ui
---

## General Design Considerations

* Generally used with limited space and/or a long list of choices
* PhET comboboxes are not auto-select when hovering options with a mouse or when navigating through options with the arrow keys (i.e., different from radio button lists)
* Label for control serves a dual purpose: identifies the combobox (list of options) and identifies the selected option
* Selected item is communicated clearly upon focus and when the list is closed
* Large pointer/click areas: box label and selected item; option labels and images

## Aesthetic Considerations
* List can appear above or below the button depending on space considerations
* Can include an indicator image (to the left of the list item)
* The rounded corners of the list should match the rounded corners of the button
* Generally, the list panel is often the same width as the button
* Mouse hover and focus highlights should be considered together

## Accessibility
The PhET combobox interaction, visually looks and behaves as a `combobox` in the sense that a list hidden options can be revealed on demand; however, the accessible representation that we have found to work nicely is actually a button with a dynamic label that can pop-up `listbox` with a list of options. Design and interaction details are below.

### Gesture Support
ToDO.

### Keyboard Support
| Key        | Function |
| ------------- |-------------|
| Enter and Space | If the listbox is NOT displayed, opens/expands the listbox and moves focus to selected option in the opened list. (Note Space key is not specified in the standard, but that's how our example and the W3C example work. Space key works on a button, but not specifically on a list.) |
| Enter | If the listbox is displayed, selects item and collapses the listbox and moves focus to the button. |
| Escape | If the listbox is displayed, collapses the listbox without changing the slection and moves focus to the button. |
| Down Arrow | Moves focus to the next option. |
| Up Arrow | Moves focus to the previous option. |
| Home (Optional) | Moves focus to first option. (Recommended when there are more than 5 items) |
| End (Optional) | Moves focus to last option. (Recommended when there are more than 5 items) |

### Role, Property, State, and Tabindex Attributes
(adjusted content from W3C listbox collapsible example, see https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)

| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|
| - | `aria-haspopup="listbox"` | `button` | Indicates that activating the button displays a listbox (i.e., a list of options) |
| - | `aria-expanded="true"` |  `button` |  Set by the JavaScript when the listbox is displayed.  Otherwise, is not present. |
| - | `aria-labelledby="listbox-static-label listbox-option-dynamic-label"` |  button |  Reads out a combined name for the interaction when focus is placed on the button, first the name for the "combobox interaction", then the name of the selected option. Javascript sets the inner content of the button to be the selected item. |
| `role="listbox"` | - | `ul` | Identifies the focusable element that has listbox behaviors and contains the listbox options. |
| - | `aria-labelledby="listbox-static-label"` | ul | Refers to the element containing the listbox label (i.e., the accessible name for the listbox). |
| - | `tabindex="-1"` | ul | - Makes the `listbox` focusable. - The JavaScript sets focus on the `listbox` when the `listbox` is displayed. |
| -    | `aria-activedescendent` | -   | - Set by the JavaScript when the listbox is displayed and sets focus on the listbox; otherwise is not present. <br> - Refers to the option in the listbox that is visually indicated as having keyboard focus. <br>- When navigation keys, such as Down Arrow, are pressed, the JavaScript changes the value. <br> - Enables assistive technologies to know which element the application regards as focused while DOM focus remains on the ul element. |
| `role="option"` | -| `li` | Identifies each selectable element containing the name of an option. |
| - | `aria-selected="true"`| `li` | - Indicates that the option is selected. <br>- Applied to the element with role option that is visually styled as selected. <br>- Set by the Javascript when Enter is pressed on the option referenced by `aria-activedescendant`. <br>- Note that in an auto-select `listbox` where selection follows focus, the option with this attribute is always the same as the option that is referenced by `aria-activedescendant`. 


### Sample HTML for Combobox
The PhET combobox interaction, visually looks and behaves as a combobox; however, the ARIA role combobox is not yet well supported. Fo the accessible representation in the Parallel DOM we implement this widget as a dynamic button and a popped-up listbox. The HTML example is below.

**Note:** The HTML for this interaction may change when the ARIA role `combobox` has better support accross assitive technologies.

#### Molarity Example (10 options)
```html
	<div tabindex="-1" id="container-for-labels">
	<span id="listbox-static-label">Solute</span>
	  <button id="listbox-option-dynamic-label" tabindex="0" aria-haspopup="listbox" aria-labelledby="listbox-static-label listbox-option-dynamic-label">Drink Mix</button>
	</div>
	<ul role="listbox" tabindex="0" id="listbox" aria-activedescendant="option-1" aria-labelledby="listbox-static-label" style="list-style:none;">
	  <li role="option" id="option-1" class="selected" aria-selected="true">Drink mix</li>
	  <li role="option" id="option-2">Cobalt (II) nitrate</li>
	  <li role="option" id="option-3">Cobalt Chloride</li>
	  <li role="option" id="option-4">Potassium dichromate</li>
	  <li role="option" id="option-5">Gold (III) chloride</li>
	  <li role="option" id="option-6">Potassium chromate</li>
	  <li role="option" id="option-7">Nickel (II) chloride</li>
	  <li role="option" id="option-8">Copper sulfate</li>
	  <li role="option" id="option-9">Potassium permanganate</li>
	  <li role="option" id="option-10">Potassium dichromate</li>
	</ul>
	<!-- help text for combobox -->
	<p>Change a solute and observe differences.</p>
```
### Supporting Accessibility Resources
* Adapted from [ARIA Practices Collapsible Listbox Example](https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)

### Design Doc Content Template Text
**Solute Combobox**
* Accessible Name for combobox interaction (i.e., lisbox label): (e.g. Solute)
* Accessible name for pop-up button is dynamic: {{Selected list item, e.g. Drink Mix}}
* Listbox: ul with role="listbox"
* Listbox items: li's with role="option"
* List Item 1 (e.g., Drink Mix)
* List Item 2 (e.g., Cobalt (II) nitrate)
* List Item 3
* Or as listed in simulation
* (Optional) Help Text:

