<p class="para">
	{{#if this.isStrong}}
		<strong>Strong Type</strong>
	{{elseif this.isEm}}
		<em>Emphasizes</em>
	{{else}}
		
		{{#if this.header}}
			<header>Header Text</header>
		{{else}}
			<span>Static regular text</span>
		{{/if}}

	{{/if}}
</p>