const CLIENT_ID = '3074457347056197788';

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
        w.style.fontSize=41;
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
            w.style.fontSize=10;
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
                    backgroundColor: "transparent",
                    backgroundOpacity: 1,
                    bold: 0,
                    borderColor: "#1a1a1a",
                    borderOpacity: 1,
                    borderStyle: 2,
                    borderWidth: 2,
                    fontFamily: 15,
                    fontSize: 10,
                    highlighting: "",
                    italic: 0,
                    shapeType: 3,
                    strike: 0,
                    textAlign: "c",
                    textAlignVertical: "m",
                    textColor: "#1a1a1a",
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
            bottomBar: {
                title: 'Place tic tac toe game',
                svgIcon: '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 8C9.7935 8 7.99988 9.79362 7.99988 12C7.99988 14.2067 9.79356 16 11.9999 16C14.2065 16 15.9999 14.2066 15.9999 12C15.9999 9.79368 14.2066 8 11.9999 8ZM9.99988 12C9.99988 10.8982 10.8981 10 11.9999 10C13.1019 10 13.9999 10.8981 13.9999 12C13.9999 13.1021 13.102 14 11.9999 14C10.898 14 9.99988 13.102 9.99988 12Z" fill="currentColor"/>' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 4C8.60666 4 5.86457 5.97111 4.04279 7.79289C3.11921 8.71648 2.39664 9.63659 1.90491 10.325C1.65843 10.6701 1.46832 10.9592 1.33841 11.1646C1.27342 11.2673 1.22339 11.3492 1.18879 11.4069C1.17149 11.4357 1.15804 11.4585 1.1485 11.4748L1.13712 11.4944L1.13365 11.5004L1.13201 11.5032L0.848145 12L1.13165 12.4961L1.9999 12C1.13165 12.4961 1.13246 12.4976 1.13246 12.4976L1.13365 12.4996L1.13712 12.5056L1.1485 12.5252C1.15804 12.5415 1.17149 12.5643 1.18879 12.5931C1.22339 12.6508 1.27342 12.7327 1.33841 12.8354C1.46832 13.0408 1.65843 13.3299 1.90491 13.675C2.39664 14.3634 3.11921 15.2835 4.04279 16.2071C5.86457 18.0289 8.60666 20 11.9999 20C15.3931 20 18.1352 18.0289 19.957 16.2071C20.8806 15.2835 21.6031 14.3634 22.0949 13.675C22.3414 13.3299 22.5315 13.0408 22.6614 12.8354C22.7264 12.7327 22.7764 12.6508 22.811 12.5931C22.8283 12.5643 22.8418 12.5415 22.8513 12.5252L22.8627 12.5056L22.8661 12.4996L22.8678 12.4968L23.1516 12L22.8681 11.5039L22.8678 12.424C22.8678 12.1948 22.8673 11.5024 22.8673 11.5024L22.8661 11.5004L22.8627 11.4944L22.8513 11.4748C22.8418 11.4585 22.8283 11.4357 22.811 11.4069C22.7764 11.3492 22.7264 11.2673 22.6614 11.1646C22.5315 10.9592 22.3414 10.6701 22.0949 10.325C21.6031 9.63659 20.8806 8.71648 19.957 7.79289C18.1352 5.97111 15.3931 4 11.9999 4ZM1.9999 12L1.13201 11.5032C1.13201 11.5032 1.13165 11.5039 1.9999 12ZM3.53238 12.5125C3.39402 12.3188 3.2762 12.1458 3.17988 12C3.2762 11.8542 3.39402 11.6812 3.53238 11.4875C3.97815 10.8634 4.63059 10.0335 5.457 9.20711C7.13522 7.52889 9.39313 6 11.9999 6C14.6067 6 16.8646 7.52889 18.5428 9.20711C19.3692 10.0335 20.0216 10.8634 20.4674 11.4875C20.6058 11.6812 20.7236 11.8542 20.8199 12C20.7236 12.1458 20.6058 12.3188 20.4674 12.5125C20.0216 13.1366 19.3692 13.9665 18.5428 14.7929C16.8646 16.4711 14.6067 18 11.9999 18C9.39313 18 7.13522 16.4711 5.457 14.7929C4.63059 13.9665 3.97815 13.1366 3.53238 12.5125Z" fill="currentColor"/>' +
                    '<path d="M4.70711 20.7071L20.7071 4.70711C21.0976 4.31658 21.0976 3.68342 20.7071 3.29289C20.3166 2.90237 19.6834 2.90237 19.2929 3.29289L3.29289 19.2929C2.90237 19.6834 2.90237 20.3166 3.29289 20.7071C3.68342 21.0976 4.31658 21.0976 4.70711 20.7071Z" fill="currentColor"/>',

                onClick: onClick
            }

        }
    })
})
