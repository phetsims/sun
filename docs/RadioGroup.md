## General Design Considerations

* ToDo
* Note I think this pattern is relevant to PhET's VerticalAquaRadioButtonGroup.js, but I need to verify.

## Aesthetic Considerations
* ToDo

## Accessibility
* consider what information is most needed for the interaction and the simulation's learning goals. For example, is the name of the group really beneficial, or the fact that it is a radiogroup, or is the number of options the most important? It is important to considers these upfront to determine how best to name and structure teh group of radio buttons.


### Gesture Support
* ToDo

### Keyboard Support
| Key        | Function |
| ------------- |-------------|

### Management of Roles, States, Properties, and Focus
(adjusted content from W3C, see ...)

| Role | Attribute | Element | Usage |
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

### Design Doc Content Template Text
**Radio Button Group**
Automatic Accessible Name via aria-labelledby: (e.g. Area Grid Size) 
Radio group: `ul` with `role="radiogroup"`
List names for radio buttons in the group
- List Item 1 (e.g. 10 by 10)
- List Item 2 (e.g. 12 by 12)
Or as listed in simulation

(Optional) Help Text: 

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