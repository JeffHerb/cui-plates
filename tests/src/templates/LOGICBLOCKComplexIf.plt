
<div class="test-case">
	<p>Tests that `this.isTrue` is equal to boolean true</p>
	{{#if this.isTrue === true}}
		<p>PASSED</p>
	{{else}}
		<p>FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isNum1` is equal to the number 1</p>
	{{#if this.isNum1 === 1}}
		<p>PASSED</p>
	{{else}}
		<p>FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isTest` is equal to the string "isTest"</p>
	{{#if this.isTest === "isTest"}}
		<p>PASSED</p>
	{{else}}
		<p>FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>PASSED</pre>
	</div>
</div>