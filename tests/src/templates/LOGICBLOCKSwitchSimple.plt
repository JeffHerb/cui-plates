<div class="message-block">
	{{#switch this.messageType}}
		{{case "error"}}
			<p class="error">{{this.message}}</p>
		{{case "warning"}}
			<p class="warning">{{this.message}}</p>
		{{case "success"}}
			<p class="success">{{this.message}}</p>
		{{default}}
			<p class="info">{{this.message}}</p>
	{{/switch}}
</div>