<table>
	<caption>Truth Table</caption>
	<thead>
		<tr>
			<th></th>
			<th>True</th>
			<th>False</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th>True</th>
			<td>
				{{#if trueTable.isTrueTrue === true}}
					<span>\u2714</span>
				{{else}}
					<span>\u2718</span>
				{{/if}}
			</td>
			<td>
				{{#if trueTable.isTrueFalse === true}}
					<span>\u2714</span>
				{{else}}
					<span>\u2718</span>
				{{/if}}
			</td>
		</tr>
		<tr>
			<th>False</th>
			<td>
				{{#if trueTable.isFalseTrue === true}}
					<span>\u2714</span>
				{{else}}
					<span>\u2718</span>
				{{/if}}
			</td>
			<td>
				{{#if trueTable.isFalseFalse === true}}
					<span>\u2714</span>
				{{else}}
					<span>\u2718</span>
				{{/if}}
			</td>
		</tr>
	</tbody>
</table>