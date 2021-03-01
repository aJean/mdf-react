{{#layout}}
<{{layout.importname}}>
{{/layout}}
{{#fallback}}
<Suspense fallback={<{{{fallback.importname}}} />}>
{{/fallback}}
<Switch>
{{#children}}
    {{#router}}
      <Route path="{{{path}}}" render={()=>{
          return (
            {{> item}}
          )
      }} />
    {{/router}}
    {{^router}}
      <Route exact path="{{{path}}}" component={ {{importname}} }/>
    {{/router}}
{{/children}}
</Switch>
{{#fallback}}
</Suspense>
{{/fallback}}

{{#layout}}
</{{layout.importname}}>
{{/layout}}