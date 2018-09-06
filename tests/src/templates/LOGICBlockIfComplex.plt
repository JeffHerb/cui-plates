{{#if this.isTrue === "static"}}
	{{#if this.isStrong}}
		<strong>Logic was true, but was not strong</strong>
	{{else}}
		<p>Logic was true, but was not strong</p>	
	{{/if}}
{{else}}
	<p>Else Logic was passed!</p>
{{/if}}
