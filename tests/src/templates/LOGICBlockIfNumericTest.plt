<h4>Numeric Tests - to test comparisons</h4>
<div class="lessThanTen">
	{{#if numeric.lessThanTen < 10}}
		<p>{{numeric.lessThanTen}} is less than 10.</p>
	{{else}}
		<p>{{numeric.lessThanTen}} is not less than to 10.</p>
	{{/if}}
</div>
<div class="greaterThanTen">
	{{#if numeric.greaterThanTen > 10}}
		<p>{{numeric.greaterThanTen}} is greater than 10.</p>
	{{else}}
		<p>{{numeric.greaterThanTen}} is not greater than to 10.</p>
	{{/if}}
</div>
<div class="isTenOrLess">
	{{#if numeric.isTen <= 10}}
		<p>{{numeric.isTen}} is less than or equal to 10.</p>
	{{else}}
		<p>{{numeric.isTen}} is not less less than or equal to to 10.</p>
	{{/if}}
</div>
<div class="isTenOrGreater">
	{{#if numeric.greaterThanTen >= 10}}
		<p>{{numeric.greaterThanTen}} is greater than or equal to 10.</p>
	{{else}}
		<p>{{numeric.greaterThanTen}} is not greater than or equal to 10.</p>
	{{/if}}
</div>
<div class="isTenString">
	{{#if numeric.isTenString == 10}}
		<p>{{numeric.isTenString}} as a string, is the same as 10 as a number (== test).</p>
	{{else}}
		<p>{{numeric.isTenString}} as a string, is not the same as 10 as a number (== test).</p>
	{{/if}}
</div>
<div class="isTenString">
	{{#if numeric.isTenString === 10}}
		<p>{{numeric.isTenString}} as a string, is the same as 10 as a number (=== test).</p>
	{{else}}
		<p>{{numeric.isTenString}} as a string, is not the same as 10 as a number (=== test).</p>
	{{/if}}
</div>
<div class="isTen">
	{{#if numeric.isTen == 10}}
		<p>{{numeric.isTen}} is equal to 10 (number == number).</p>
	{{else}}
		<p>{{numeric.isTen}} is not equal to 10 (number == number).</p>
	{{/if}}
</div>
<div class="isTen">
	{{#if numeric.isTen === 10}}
		<p>{{numeric.isTen}} is equal to 10 (number === number).</p>
	{{else}}
		<p>{{numeric.isTen}} is not equal to 10 (number === number).</p>
	{{/if}}
</div>