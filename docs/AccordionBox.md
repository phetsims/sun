## General Design Considerations

Here’s when and why we use accorion boxes:
* Default state can be expanded or collapsed depending on how the designer wants to scaffold the user interaction. A closed panel can be used to keep the default opening condition of sim from being visually overwhelming, and suggesting a logical route for exploration, for example in BaA and in GE:B.
* Accordion boxes can also be useful for teachers to ask predictive questions.
* Can contain non-interactive readouts, interactive controls, but not sprites (e.g., draggable toolbox items).

## Aesthetic Considerations
* If space is a concern, the title can be hidden while the accordion box is expanded. 
* An expanded accordion box cannot overlap other elements when opened (unlike combo box, for instance).
* Always includes a toggle button to expand/collapse, typically to the left of the title.  
* Other sim content does not fill the space when an accordion box is collapsed.
* The accordion box content can be expanded or collapsed by default and a change of state for one accordion does not typically affect the state of other accordion boxes.
 

## Accessibility Considerations
* Typically, has a visual title with an icon that indicates expanded and collapsed state.
  * The title may may disappear when box is expanded.
  * Focus highlight would go around title in both the expanded and collapsed states, if title remains visible.
  * If title visually disappears when expanded, the focus highlight would be limited to the open/close icon and the designer would need to consider extra padding to ensure a reasonable clickable area. 
  * It is possible that the focus highlight can change size when toggling between expanded/collapsed states in the scenario when the expanded box does not have a title. 
* The typical structure is a `button` nested within the parent titling element, likely a heading.
* Typically, the open/close icon does not need to be represented in the Parallel DOM.
* For accessibility the expanded and collapsed states of the box are communicated through a combination of ARIA attributes, `aria-expanded`, `aria-controls`, `aria-hidden` that have to be managed through javascript.

### Gesture Support
ToDO.

### Keyboard Support
| Key        | Function |
| ------------- |-------------|


### Management of Role, Property, State, and Tabindex Attributes

| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|



### DRAFT: Sample HTML
```html
	<h3>
	   <button aria-expanded="true" aria-controls="collapsible-1">Factors</button>
	</h3>
	<div id="collapsible-1" aria-hidden="false">
	   <p>Box content.</p>
	   <p>Content.</p>
	</div>
  <h3>
     <button aria-expanded="false" aria-controls="collapsible-2">Product</button>
  </h3>
  <div id="collapsible-2" aria-hidden="true">
     <p>Box content.</p>
     <p>Content.</p>
  </div>
```
### Supporting Accessibility Resources
* Adapted from [ARIA Practices]()

### Design Doc Content Template Text
**Accordion Box**
Accordion Box Title:
Accessible Name: (Defaults to the same as the title)
Accordion Title Hidden: Yes/No (defaults to No)
If using a heading as the button wrapper, define heading level: (defaults is H3)
Default open state: expanded/collapsed (Question: What is the best default?)

Start of Accordion Box Content
Parent container accordion box contents: defaults to a div
 - Use same convention as other objects and controls.
End of Accodion Box Content 



