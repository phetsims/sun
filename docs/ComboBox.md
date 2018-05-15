## General Design Considerations

* Generally used with limited space and/or a longer list of choices
* PhET comboboxes are not auto-select when hovering options with a mouse or when navigating through options with the arrow keys (i.e., different from radio button lists)
* Sometimes serves a dual purpose as a label, but can also include an additional label
* Selected item is communicated clearly upon focus and when the list is closed
* Large pointer/click areas: box label and selected item; option labels and images

## Aesthetic Considerations
* List can appear above or below the button depending on space considerations
* Can include an indicator image (to the left of the list item)
* The rounded corners of the list should match the rounded corners of the button
* Generally, the list panel is often the same width as the button
* Mouse hover and focus highlights shoul dbe considered together

## Accessibility
The PhET combobox interaction, visually looks and behaves as a `combobox` in the sense that a list hidden options can be revealed on demand; however, the accessible representation that we have found to work nicely is actually a button with a dynamic label that can pop-up `listbox` with a list of options. Design and interaction details are below.

### Gesture Support
ToDO.

### Keyboard Support
| Key        | Function |
| ------------- |-------------|
| Enter and Space | If the listbox is NOT displayed, opens/expands the listbox and moves focus to selected option in the opened list. (Note Space key is not specified in the standard, but that's how our example and the W3C example work. Space key works on a button, but not specifically on a list.) |
| Enter | If the listbox is displayed, collapses the listbox and moves focus to the button. |
| Escape | If the listbox is displayed, collapses the listbox and moves focus to the button. |
| Down Arrow | Moves focus to the next option. |
| Up Arrow | Moves focus to the previous option. |
| Home (Optional) | Moves focus to first option. |
| End (Optional) | Moves focus to last option. |

### Role, Property, State, and Tabindex Attributes
(adjusted content from W3C listbox collapsible example, see https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)

| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|
|  -    | aria-haspopup="listbox" | button | Indicates that activating the button displays a listbox (i.e., a list of options) |
|   -   | aria-expanded="true" |  button |  Set by the JavaScript when the listbox is displayed.  Otherwise, is not present. |
|   -   | aria-labelledby="button-static-name button-dynamic-name" |  button |  Reads out a combined name for the interaction when focus is placed on the button, first the name for the interaction, then the name of the selected item. Javascript sets the inner content of the button to be the selected item. |


### Sample HTML
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
```
### Supporting Accessibility Resources
* [ARIA Practices Collapsible Listbox Example](https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)

### Design Doc Content Template Text
**Combobox**
Accessible Name: (e.g. Solute) 
Button Label: {{Selected list item}}
Listbox list items:
List Item 1 (e.g. Drink Mix)
List Item 2
List Item 3
Or as listed in simulation
(Optional) Help Text: 

