
<div class="test-case">
	<p>Tests that `this.isTrue` is equal to boolean true</p>
	{{#if this.isTrue === true}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isNum1` is equal to the number 1</p>
	{{#if this.isNum1 === 1}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isTest` is equal to the string "isTest"</p>
	{{#if this.isTest === "isTest"}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: PASSED</pre>
	</div>
</div>
<hr>
<div class="test-case">
	<p>Tests that `this.isNum1` is greater then (>) 0</p>
	{{#if this.isNum1 > 0}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isNum1` is less then (<) 0</p>
	{{#if this.isNum1 < 0}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: FAILED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isNum1` is greater or equal (>=) to 0</p>
	{{#if this.isNum1 >= 0}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: PASSED</pre>
	</div>
</div>
<div class="test-case">
	<p>Tests that `this.isNum1` is less then or equal (<=) to 0</p>
	{{#if this.isNum1 <= 0}}
		<p>Test: PASSED</p>
	{{else}}
		<p>Test: FAILED</p>
	{{/if}}
	<div class="expected">
		<pre>Expected: FAILED</pre>
	</div>
</div>
