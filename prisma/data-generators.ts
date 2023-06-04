class Page {
    public owner: {connect: {id: string}};
    public content: string;
    public nextChoices: {create: Choice[]};
    constructor(content: string, nextChoices: {create: Choice[]}, owner: {connect: {id: string}}) {
        this.content = content;
        this.nextChoices = nextChoices;
        this.owner = owner
    }
}

class Choice {
    public owner: {connect: {id: string}};
    public content: string;
    public nextPage: {create: Page} | undefined;
    constructor(content: string, owner: {connect: {id: string}}) {
        this.content = content;
        this.owner = owner;
        this.nextPage = undefined;
    }
}

export function parseTestData(testData: string, owner: {connect: {id: string}}) {
    const lines = testData.split('\n');
    const pages: Record<number, Page[]> = {};
    const choices: Record<number, Choice[]> = {};

    for (const line of lines) {
        const depth = line.search(/\S/) / 4;
        const content = line.trim();


        if (content.startsWith('Page:')) {
            const page = new Page(content.slice(5).trim(), {create: []}, owner);

            if (depth > 0) {
                if (!choices[depth - 1]) {
                    throw Error(`Found incorrect indentation for line "${line}"`)
                }

                const choicesAtDepth = choices[depth - 1]
                choicesAtDepth[choicesAtDepth.length - 1].nextPage = {create: page}
            }

            pages[depth] = (pages[depth] ?? []).concat(page)
        } else if (content.startsWith('Choice:')) {
            if (!pages[depth - 1]) {
                throw Error(`Found incorrect indentation for line "${line}"`)
            }
            const choice = new Choice(content.slice(7).trim(), owner);
            const pagesAtDepth = pages[depth - 1]

            pagesAtDepth[pagesAtDepth.length - 1].nextChoices.create.push(choice)
            choices[depth] = (choices[depth] ?? []).concat(choice)
        }
    }

    return pages[0][0];
}
