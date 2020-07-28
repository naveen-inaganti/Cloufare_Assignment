class ElementHandler
{

	constructor(elementCheck,variant) 
	{
    	this.elementCheck = elementCheck
    	this.variant=variant
  	}

	element(element)
	{
		
		if(this.elementCheck==='description')
		{
			if(this.variant=='first')
				element.setInnerContent('My Linkedin Profile')
			if(this.variant=='second')
				element.setInnerContent('My Github Profile')
		}
		if(this.elementCheck==='url')
		{
			if(this.variant=='first')
				{
					element.setInnerContent('Go To Linkedin')
					element.setAttribute('href','https://www.linkedin.com/in/inkr')
				}
			if(this.variant=='second')
				{
					element.setInnerContent('Go To Github')
					element.setAttribute('href','https://www.github.com/naveen-inaganti')
				}
		}
		if(this.elementCheck==='htitle')
		{
			if(this.variant=='first')
				element.setInnerContent('Linkedin')
			if(this.variant=='second')
				element.setInnerContent('Github')
		}

		if(this.elementCheck==='title')
		{
			if(this.variant=='first')
				element.setInnerContent('My Linkedin Info')
			if(this.variant=='second')
				element.setInnerContent('My Github Info')
		}
	}
}


const rewriter_1= new HTMLRewriter()
	.on('p#description', new ElementHandler('description','first'))
	.on('a#url', new ElementHandler('url','first'))
	.on('h1#title', new ElementHandler('htitle','first'))
	.on('title', new ElementHandler('title','first'))

const rewriter_2= new HTMLRewriter()
	.on('p#description', new ElementHandler('description','second'))
	.on('a#url', new ElementHandler('url','second'))
	.on('h1#title', new ElementHandler('htitle','second'))
	.on('title', new ElementHandler('title','second'))


//start event handler
addEventListener('fetch', async event => {
  event.respondWith(serverResponse(event))
})


//retrieves json and fetches the html from urls and display one based 50/50 split
async function serverResponse(event)
{
	const result = await fetchGetJson('https://cfw-takehome.developers.workers.dev/api/variants')
	const json=JSON.parse(result)

	const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }

	const NAME = 'experiment'
	const cookie = event.request.headers.get('cookie')
	if (cookie && cookie.includes(`${NAME}=variant1`))
	{
    			let htmlresponse = await fetch(json.variants[0], init)
		    	let htmlresults = await gatherResponse(htmlresponse)
		    	let final_result_1=new Response(htmlresults,init)
		    	let VARIANT1=rewriter_1.transform(final_result_1);
		    	let response=VARIANT1
		    	return response
  	} 
  	else if (cookie && cookie.includes(`${NAME}=variant2`)) 
  	{
    			let htmlresponse = await fetch(json.variants[1], init)
		    	let htmlresults = await gatherResponse(htmlresponse)
		    	let final_result_2=new Response(htmlresults,init)
		    	let VARIANT2=rewriter_2.transform(final_result_2);
		    	let response=VARIANT2
		    	return response
    }
    else
    {
		    let group = Math.random() < 0.5 ? 'variant1' : 'variant2' // 50/50 split
		    if(group=='variant1')
		    {
		    	let htmlresponse = await fetch(json.variants[0], init)
		    	let htmlresults = await gatherResponse(htmlresponse)
		    	let final_result_1=new Response(htmlresults,init)
		    	let VARIANT1=rewriter_1.transform(final_result_1);
		    	let response=VARIANT1
		    	response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
		    	return response

		    }

		     else if(group=='variant2')
		    {
		    	let htmlresponse = await fetch(json.variants[1], init)
		    	let htmlresults = await gatherResponse(htmlresponse)
		    	let final_result_2=new Response(htmlresults,init)
		    	let VARIANT2=rewriter_2.transform(final_result_2);
		    	let response=VARIANT2
		    	response.headers.append('Set-Cookie', `${NAME}=${group}; path=/`)
		    	return response

		    }
	}


}



//retreives json from and return it as json string
async function fetchGetJson(url) {

  const init = {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  }
  const response = await fetch(url,init)
  const respBody = await gatherResponse(response)
  return respBody
}

//send json as string or html of requested url
async function gatherResponse(response){

	const { headers } = response
    const contentType = headers.get('content-type')

   if (contentType.includes('application/json')) {
    const body = await response.json()
	return JSON.stringify(body)
	}
  else if (contentType.includes('text/html')) {
    return await response.text()
	}
}