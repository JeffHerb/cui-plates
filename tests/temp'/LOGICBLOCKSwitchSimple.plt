<div class="message-block">
	{{#switch this.messageType}}
		{{case "info"}}
			<p class="error">{{this.message}}</p>
		{{case "warning"}}
			<p class="warning">{{this.message}}</p>
		{{case "success"}}
			<p class="success">{{this.message}}</p>
		{{default}}
			<p class="error">{{this.messageFailed}}</p>

			{{#switch error}}

				{{case this.system}}
					<p>Issue is related the system</p>
					
				{{case this.framework}}
					<p>Issue is related to the framework</p>

				{{case this.developer}}
					<p>Issue is related to a developer</p>

			{{/switch}}

			<p> after catch !</p>

	{{/switch}}
</div>