<h4>Numeric Tests</h4>
<div class="isTen">
	{{#if numeric.isTen === 10}}
		<p>{{numeric.isTen}} is equal to 10.</p>
	{{else}}
		<p>{{numeric.isTen}} is not equal to 10.</p>
	{{/if}}
</div>
<div class="lessThanTen">
	{{#if numeric.lessThanTen < 10}}
		<p>{{numeric.lessThanTen}} is less than 10.</p>
	{{else}}
		<p>{{numeric.lessThanTen}} is not less than to 10.</p>
	{{/if}}
</div>
<div class="greaterThanTen">
	{{#if numeric.greaterThanTen < 10}}
		<p>{{numeric.greaterThanTen}} is greater than 10.</p>
	{{else}}
		<p>{{numeric.greaterThanTen}} is not greater than to 10.</p>
	{{/if}}
</div>