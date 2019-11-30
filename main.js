const CLIENT_ID = '3074457347056197788';
const BACKGROUND_COLOR="#12cdd4";
const X_COLOR = "#1a1a1a" ;
const O_COLOR = "#ffffff";
async function changeTicTacToeWidget(w) {
    let gameId = w.metadata[CLIENT_ID].gameId;
    let allGameWidgets = await miro.board.widgets.get({metadata: {[CLIENT_ID]: {gameId: gameId}}});//'metadata.' + CLIENT_ID + '.gameId.' + gameId
    if (allGameWidgets.length != 9) {
        miro.showErrorNotification("Lol, you broke the game! Where are all the boxes? Clear it and create a new board...");
        return;
    }
    let countX = 0;
    let countO = 0;
    for (widget of allGameWidgets) {
        if (widget.text === "X") {
            countX++;
        }
        if (widget.text === "O") {
            countO++;
        }
    }

    let selectedWasEmpty = w.text !== "X" && w.text !== "O";
    if (!(countX === countO || countX === countO + 1)) {
        // X starts first so it has to be equal or one more, otherwise it is an error
        miro.showErrorNotification("Lol, you broke the game! Incorrect number of tics and tacs... Clear it and create a new board...");
        return;
    }

    if (selectedWasEmpty) {
        w.metadata[[CLIENT_ID]].order =countX + countO + 1;

        w.style.textColor= (countX > countO ? O_COLOR : X_COLOR);
        miro.board.widgets.update({
            id: w.id,
            text: (countX > countO ? "O" : "X"),
            metadata: w.metadata,
            style:w.style
        });

    } else {
        if (w.metadata[CLIENT_ID].order !== (countX + countO)) {
            miro.showNotification("You can only reverse recently places tic or tac.");
        } else {
            w.metadata[[CLIENT_ID]].order =0;
            w.style.textColor= BACKGROUND_COLOR;

            miro.board.widgets.update({id: w.id, text:  ".", metadata: w.metadata, style:w.style});
        }
    }
}

async function onCanvasClicked(e) {
    const widgets = await miro.board.widgets.__getIntersectedObjects(e.data)

    const ticTacToeWidgets = widgets.filter((w) => {
        return w.metadata[CLIENT_ID];
    });
    if (ticTacToeWidgets.length > 0) {
        miro.board.selection.clear();
        for (let widget of ticTacToeWidgets) {
            await changeTicTacToeWidget(widget);
        }
    }
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const DEFAULT_BOX_SIZE = 100;

async function doIt() {
    let place = confirm("Please confirm you want to place new tic tac toe game onto board");
    if (!place) return;

    let viewport = await miro.board.viewport.getViewport();
    let initialPosX = viewport.x + 0.3 * viewport.width;
    let initialPosY = viewport.y + 0.3 * viewport.height;

    let widgetsToCreate = [];
    let gameId = makeid(10);
    let gameType = "tic-tac-toe"; // maybe we will add more, better safe than sorry
    for (let ny = 0; ny < 3; ny++) {
        for (let nx = 0; nx < 3; nx++) {
            widgetsToCreate.push({
                type: 'shape',
                text: ".",
                x: initialPosX + nx * DEFAULT_BOX_SIZE,
                y: initialPosY + ny * DEFAULT_BOX_SIZE,
                width: DEFAULT_BOX_SIZE,
                height: DEFAULT_BOX_SIZE,
                style: {
                    backgroundColor: BACKGROUND_COLOR,
                    backgroundOpacity: 1,
                    bold: 0,
                    borderColor: "#0ca789",
                    borderOpacity: 1,
                    borderStyle: 2,
                    borderWidth: 2,
                    fontFamily: 15,
                    fontSize: 48,
                    highlighting: "",
                    italic: 0,
                    shapeType: 3,
                    strike: 0,
                    textAlign: "c",
                    textAlignVertical: "m",
                    textColor: BACKGROUND_COLOR,
                    underline: 0,
                },
                metadata: {
                    [CLIENT_ID]: {
                        x: nx,
                        y: ny,
                        gameId: gameId,
                        gameType: gameType
                    }
                }
            });
        }
    }
    miro.board.widgets.create(widgetsToCreate);

}


let authorizer = new Authorizer(["boards:write", "boards:read"]);
let listener;

async function onClick() {
    if (await authorizer.authorized()) {
        return doIt();
    }
}

miro.onReady(async () => {
    if (await authorizer.isAuthorized()) {
        listener =
            miro.addListener('CANVAS_CLICKED', onCanvasClicked);
    }
    miro.initialize({
        extensionPoints: {
            toolbar: {
                title: 'Place tic tac toe game',
                toolbarSvgIcon: '<path d="M5.29289 6.5L2.14645 9.90865C1.95118 10.1202 1.95118 10.4631 2.14645 10.6747C2.34171 10.8862 2.65829 10.8862 2.85355 10.6747L6 7.26603L9.14645 10.6747C9.34171 10.8862 9.65829 10.8862 9.85355 10.6747C10.0488 10.4631 10.0488 10.1202 9.85355 9.90865L6.70711 6.5L9.85355 3.09135C10.0488 2.87981 10.0488 2.53685 9.85355 2.32531C9.65829 2.11378 9.34171 2.11378 9.14645 2.32531L6 5.73396L2.85355 2.32531C2.65829 2.11378 2.34171 2.11378 2.14645 2.32531C1.95118 2.53685 1.95118 2.87981 2.14645 3.09135L5.29289 6.5Z" fill="currentColor"/>\n' +
                    '<path d="M17.2929 17.5L14.1464 20.9087C13.9512 21.1202 13.9512 21.4632 14.1464 21.6747C14.3417 21.8862 14.6583 21.8862 14.8536 21.6747L18 18.266L21.1464 21.6747C21.3417 21.8862 21.6583 21.8862 21.8536 21.6747C22.0488 21.4632 22.0488 21.1202 21.8536 20.9087L18.7071 17.5L21.8536 14.0914C22.0488 13.8798 22.0488 13.5369 21.8536 13.3253C21.6583 13.1138 21.3417 13.1138 21.1464 13.3253L18 16.734L14.8536 13.3253C14.6583 13.1138 14.3417 13.1138 14.1464 13.3253C13.9512 13.5369 13.9512 13.8798 14.1464 14.0914L17.2929 17.5Z" fill="currentColor"/>\n' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M13 6.5C13 3.50846 15.2386 1.08334 18 1.08334C20.7614 1.08334 23 3.50846 23 6.5C23 9.49155 20.7614 11.9167 18 11.9167C15.2386 11.9167 13 9.49155 13 6.5ZM18 2.16667C15.7909 2.16667 14 4.10677 14 6.5C14 8.89324 15.7909 10.8333 18 10.8333C20.2091 10.8333 22 8.89324 22 6.5C22 4.10677 20.2091 2.16667 18 2.16667Z" fill="currentColor"/>\n' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M1 17.5C1 14.5085 3.23858 12.0833 6 12.0833C8.76142 12.0833 11 14.5085 11 17.5C11 20.4915 8.76142 22.9167 6 22.9167C3.23858 22.9167 1 20.4915 1 17.5ZM6 13.1667C3.79086 13.1667 2 15.1068 2 17.5C2 19.8932 3.79086 21.8333 6 21.8333C8.20914 21.8333 10 19.8932 10 17.5C10 15.1068 8.20914 13.1667 6 13.1667Z" fill="currentColor"/>',
                librarySvgIcon:
                    '<path d="M10.5858 13L4.29289 19.8173C3.90237 20.2404 3.90237 20.9263 4.29289 21.3494C4.68342 21.7724 5.31658 21.7724 5.70711 21.3494L12 14.5321L18.2929 21.3494C18.6834 21.7724 19.3166 21.7724 19.7071 21.3494C20.0976 20.9263 20.0976 20.2404 19.7071 19.8173L13.4142 13L19.7071 6.1827C20.0976 5.75963 20.0976 5.0737 19.7071 4.65064C19.3166 4.22757 18.6834 4.22757 18.2929 4.65064L12 11.4679L5.70711 4.65064C5.31658 4.22757 4.68342 4.22757 4.29289 4.65064C3.90237 5.0737 3.90237 5.75963 4.29289 6.1827L10.5858 13Z" fill="currentColor"/>\n' +
                    '<path d="M34.5858 35L28.2929 41.8173C27.9024 42.2404 27.9024 42.9263 28.2929 43.3494C28.6834 43.7724 29.3166 43.7724 29.7071 43.3494L36 36.5321L42.2929 43.3494C42.6834 43.7724 43.3166 43.7724 43.7071 43.3494C44.0976 42.9263 44.0976 42.2404 43.7071 41.8173L37.4142 35L43.7071 28.1827C44.0976 27.7596 44.0976 27.0737 43.7071 26.6506C43.3166 26.2276 42.6834 26.2276 42.2929 26.6506L36 33.4679L29.7071 26.6506C29.3166 26.2276 28.6834 26.2276 28.2929 26.6506C27.9024 27.0737 27.9024 27.7596 28.2929 28.1827L34.5858 35Z" fill="currentColor"/>\n' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M26 13C26 7.01691 30.4772 2.16666 36 2.16666C41.5228 2.16666 46 7.01691 46 13C46 18.9831 41.5228 23.8333 36 23.8333C30.4772 23.8333 26 18.9831 26 13ZM36 4.33333C31.5817 4.33333 28 8.21353 28 13C28 17.7865 31.5817 21.6667 36 21.6667C40.4183 21.6667 44 17.7865 44 13C44 8.21353 40.4183 4.33333 36 4.33333Z" fill="currentColor"/>\n' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M2 35C2 29.0169 6.47715 24.1667 12 24.1667C17.5228 24.1667 22 29.0169 22 35C22 40.9831 17.5228 45.8333 12 45.8333C6.47715 45.8333 2 40.9831 2 35ZM12 26.3333C7.58172 26.3333 4 30.2135 4 35C4 39.7865 7.58172 43.6667 12 43.6667C16.4183 43.6667 20 39.7865 20 35C20 30.2135 16.4183 26.3333 12 26.3333Z" fill="currentColor"/>',
                onClick: onClick
            }

        }
    })
})
