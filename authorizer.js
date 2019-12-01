function contains(a1, a2) {
    let superSet = {};
    for (let i = 0; i < a1.length; i++) {
        const e = a1[i];
        superSet[e] = 1;
    }

    for (let i = 0; i < a2.length; i++) {
        const e = a2[i];
        if (!superSet[e]) {
            return false;
        }
    }
    return true;
}

class Authorizer {
    authorizeOptions = {
        response_type: 'token',
        redirect_uri: 'https://kaszaq.github.io/miro-tic-tac-toe/authFinished.html'
    };
    initPostAuth;
    constructor(requiredScope) {
        this.requiredScope = requiredScope;
        this.authz = false;
    }

    async isAuthorized() { // todo: rename checkIsAuthorized
        if (!this.authz) {
            this.authz = contains(await miro.currentUser.getScopes(), this.requiredScope);
        }
       return this.authz;
    }

    registerPostAuthFunction(postAuthFunction){
        this.initPostAuth = postAuthFunction;
    }

    async authorized() {
        if(await this.isAuthorized()){
           return true;
        }

        let _parent = this;
        authorizer.authorize().then(async ()=>{
            if(_parent.initPostAuth && await _parent.isAuthorized()){
                _parent.initPostAuth();
            }
        });
        return false;

    }

    async authorize() {
        return miro.authorize(this.authorizeOptions);
    }
}