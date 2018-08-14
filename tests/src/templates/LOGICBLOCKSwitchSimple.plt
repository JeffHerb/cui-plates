<div class="message-block">
	{{#switch this.messageType}}
		{{case "info"}}
			<p class="info">{{this.message}}</p>
		{{case "warning"}}
			<p class="warning">{{this.message}}</p>
		{{case "success"}}
			<p class="error">{{this.message}}</p>
	{{/switch}}
</div>