import type { V2_MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import type { AppLoaderArgs} from '~/types';

export const meta: V2_MetaFunction = () => {
	return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}

export const loader = async ({ context }: AppLoaderArgs) => {
	return context
}

export default function Index() {
	const env = useLoaderData<typeof loader>()
	return (
		<>
			<h1 className="text-3xl font-bold underline">Hello world!</h1>
			<h2>Env: {env.ENVIRONMENT}</h2>
		</>
	)
}
