{{#if this.isTrue}}
	{{#if this.isStrong}}
		<strong>Logic was true and strong!</strong>
	{{else}}
		<p>Logic was true, but was not strong</p>	
	{{/if}}
{{else}}
	<p>Else Logic was passed!</p>
{{/if}}