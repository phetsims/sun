## General design considerations

* Generally used with limited space and/or a longer list of choices is desired since the list disappears
* PhET comboboxes are not auto-select when hovering options with a mouse or when navigating through options with the arrow keys (i.e., different from radio button lists)
* Sometimes serves a dual purpose as a label, but can also include an additional label
* Selected item is communicated clearly upon focus and when the list is closed
* Large pointer/click areas: box label and selected item; option labels and images

## Aesthetic considerations
List can appear above or below the button depending on space considerations
Can include an indicator image (to the left of the list item)
The rounded corners of the list should match the rounded corners of the button
Generally, the list panel is often the same width as the button
Mouse hover and focus highlights
Options

## Keyboard Support
| Key        | Function |
| ------------- |-------------|
| Enter and Space | If the listbox is NOT displayed, opens/expands the listbox and moves focus to selected option in the opened list. (Note Space key is not specified in the standard, but that's how our example and the W3C example work. Space key works on a button, but not specifically on a list.) |
| Enter | If the listbox is displayed, collapses the listbox and moves focus to the button. |
| Escape | If the listbox is displayed, collapses the listbox and moves focus to the button. |
| Down Arrow | Moves focus to the next option. |
| Up Arrow | Moves focus to the previous option. |
| Home (Optional) | Moves focus to first option. |
| End (Optional) | Moves focus to last option. |

## Role, Property, State, and Tabindex Attributes
(adjusted content from W3C listbox collapsible example, see https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)

| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|
|  -    | aria-haspopup="listbox" | button | Indicates that activating the button displays a listbox (i.e., a list of options) |
|   -   | aria-expanded="true" |  button |  Set by the JavaScript when the listbox is displayed.  Otherwise, is not present. |
|   -   | aria-labelledby="button-static-name button-dynamic-name" |  button |  Reads out a combined name for the interaction when focus is placed on the button, first the name for the interaction, then the name of the selected item. Javascript sets the inner content of the button to be the selected item. |

Sample HTML
```html
<div tabindex="-1" id="container-4-59-414-303-307">
    <span id="listbox5-static-label">Solute</span>
      <button id="listbox5-dynamic-label" tabindex="0" aria-haspopup="listbox" aria-labelledby="listbox5-static-label listbox5-dynamic-label">Drink Mix</button>
    </div>
    <ul role="listbox" tabindex="0" id="listbox5" aria-activedescendant="listbox5-1" aria-labelledby="listbox5-static-label" style="list-style:none;">
      <li role="option" id="listbox5-1" class="selected" aria-selected="true">Drink mix</li>
      <li role="option" id="listbox5-2">Cobalt (II) nitrate</li>
      <li role="option" id="listbox5-3">Cobalt Chloride</li>
      <li role="option" id="listbox5-4">Potassium dichromate</li>
      <li role="option" id="listbox5-5">Gold (III) chloride</li>
      <li role="option" id="listbox5-6">Potassium chromate</li>
      <li role="option" id="listbox5-7">Nickel (II) chloride</li>
      <li role="option" id="listbox5-8">Copper sulfate</li>
      <li role="option" id="listbox5-9">Potassium permanganate</li>
      <li role="option" id="listbox5-10">Potassium dichromate</li>
    </ul>
```
Supporting Resources
https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html
