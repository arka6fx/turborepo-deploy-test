import { prisma } from "@repo/prisma";

export default async function Home() {
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
    });

    const username = user?.name ?? user?.email ?? "No user found";
    const password = user?.password ?? "No password available";

    return (
        <main className="grid min-h-screen place-items-center bg-gradient-to-br from-cyan-100 via-slate-100 to-indigo-100 p-6 font-mono">
            <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-300/50 backdrop-blur md:p-10">
                <p className="mb-4 inline-block rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-700">
                    [[WS + Prisma Demo + http]]
                </p>
                <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
                    User Credentials
                </h1>
                <p className="mb-8 text-sm text-slate-600">
                    Latest user from your database displayed in a simple form.
                </p>

                <form className="grid gap-2">
                    <label
                        className="text-xs font-semibold uppercase tracking-wide text-slate-700"
                        htmlFor="username"
                    >
                        Username
                    </label>
                    <input
                        id="username"
                        className="mb-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring"
                        value={username}
                        readOnly
                    />

                    <label
                        className="text-xs font-semibold uppercase tracking-wide text-slate-700"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-cyan-300 transition focus:ring"
                        type="text"
                        value={password}
                        readOnly
                    />
                </form>
            </div>
        </main>
    );
}
