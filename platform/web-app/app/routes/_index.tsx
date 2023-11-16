import type {MetaFunction, LoaderFunctionArgs} from "@remix-run/node";
import {json} from '@remix-run/node';
import {useLoaderData} from '@remix-run/react';
import {getProbeItems} from '~/api/probetable.server';

export const meta: MetaFunction = () => {
    return [
        {title: "New Remix App"},
        {name: "description", content: "Welcome to Remix!"},
    ];
};

export const loader = async (args: LoaderFunctionArgs) => {
    const {request} = args;
    const url = new URL(request.url);
    const probeItems = await getProbeItems();
    return json({origin: url.origin, probeItems});
};

export default function Index() {
    const {origin, probeItems} = useLoaderData<typeof loader>();
    return (
        <div className="p-4">
            <h1>Welcome to Remix</h1>
            <div className="flex flex-col gap-4">
                <div>
                    <code>
                        <pre>
                          {JSON.stringify(origin)}
                        </pre>
                    </code>
                </div>
                <div>
                    <code>
                        <pre>
                          {JSON.stringify(probeItems, null, 4)}
                        </pre>
                    </code>
                </div>
            </div>
        </div>
    );
}
