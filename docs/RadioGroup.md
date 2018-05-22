## General Design Considerations
* ToDo.

## Aesthetic Considerations
* ToDo

## Accessibility Considerations
* Consider what information is most needed for communicating the interaction. For example,  
  * the name of the group,
  * the fact that it is a radiogroup,
  * the number of options or items, or
  * all three?
  * It is important to consider the above upfront to determine if all the information needs to be provided. The default would be that all inforamtion is read out.

### Special Note 
* `div` or `fieldset` as containing parent? While testing in Safari with VoiceOver, it is not yet clear that a using a `fieldset` the `radiogroup` parent adds a lot of benefit for `radigroup`s in PhET's simulations. Though the `fieldset` is clearly benefical for other desgin scenarios such as interactive forms. TODO - list out pros and cons for PhEt Simulations.

### Gesture Support
* ToDo


### Keyboard Support
| Key        | Function |
| Tab |- Moves focus to the checked `radio` button in the `radiogroup`. (PhET `radiogroup`'s generally have a pre-selected `radio`.)
   - If a `radio` button is not checked, focus moves to the first radio button in the group. PhET radios always have a 
   - PhET Focus Highlight: Keyboard focus on radiobutton with group focus highlight on group.
|
| Space |
    - If the `radio` button with focus is not checked, changes the state to `checked`. (Unlikely, for PhET radio groups.)
    - Otherwise, does nothing.
    - Note: The state where a `radio` is not checked only occurs on page load. (Unlikely, for PhET radio groups.)
|
| Right arrow, Down arrow |
    - Moves focus to and checks the next `radio` button in the group.
    - If focus is on the last `radio` button, moves focus to the first `radio` button.
    - The state of the previously checked `radio` button is changed to unchecked.
|
| Left arrow, Up arrow |
    - Moves focus to and checks the previous `radio` button in the group.
    - If focus is on the first `radio` button, moves focus to and checks the last `radio` button.
    - The state of the previously checked `radio` button is changed to unchecked.
|

Table content slightly adpated from: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

### Management of Roles, States, Properties, and Focus
Content adpated from: [Aria Practices, 3.16 Radio Group](https://www.w3.org/TR/wai-aria-practices/#radiobutton)

| Role | Attribute | Element | Usage |
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|
| ------------- |-------------| ------------- |-------------|


### Sample HTML: Automatic name  and explicit role semantics
Example is based on the _scene seletion_ radio buttons in Area Model Introduction. The visual appearence of PhET's scene selection buttons is more like small buttons than traditional radio buttons. When using this pattern where the name of the group is read out automatically, the name should be as succinct as possible.

```html
<div>
  <h3 id="accessible-name-01">Area Grid Size</h3>
    <ul role="radiogroup" aria-labelledby="accessible-name-01">
      <li>
        <input id="rbutton-01" type="radio" checked>
        <label id="label-id-01" for="rbutton-01">10 by 10 board</label>
      </li>
      <li>
        <input id="rbutton-02" type="radio">
        <label id="label-id-02" for="rbutton-02">12 by 12 board</label>
      </li>
    </ul>
</div>
```

### Sample HTML: Selected radio button, group name and number of items
``` html
		<div aria-labelledby="rg11-heading" role="radiogroup" tabindex="0">
			<h3 id="rg11-heading">Charge Settings</h3>
				<ul class="rgroup" aria-labelledby="rg11-heading">
					<li checked><input id="r11-1" type="radio" checked tabindex="0">
						<label for="r11-1">Show all charges</label>
					</li>
					<li><input id="r11-2" type="radio">
						<label for="r11-2">Show no charges</label>
					</li>
					<li><input id="r11-3" type="radio">
						<label for="r11-3">Show charge differences</label>
					</li>
				</ul>
		</div>
```

### Sample HTML: Name and description on-demand, and implicit list semantics
```html
<div>
	<h3 id="rgroup-on-demand-heading-02">Charge Settings</h3>
	<p id="description-helptext-02">Choose how you see or hear charge information.</p>
	<ul>
		<li><input id="rbutton2-01" type="radio" checked>
			<label for="rbutton2-01">Show all charges</label>
		</li>
		<li><input id="rubbtuon2-02" type="radio">
			<label for="rbutton2-02">Show no charges</label>
		</li>
		<li><input id="rbutton2-03" type="radio">
			<label for="rbutton2-03">Show charge differences</label>
		</li>
	</ul>
</div>

```

### Supporting Accessibility Resources
* Adapted from [ARIA Practices ??](??)

### Design Doc Content Template Text (DRAFT)
**Radio Button Group**
Automatic Accessible Name via aria-labelledby: (e.g. Area Grid Size) 
Radio group: `ul` with `role="radiogroup"`
List names for radio buttons in the group
- List Item 1 (e.g. 10 by 10)
- List Item 2 (e.g. 12 by 12)
Or as listed in simulation

(Optional) Help Text: 