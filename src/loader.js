class Loader {
    static eval(url,content) {
        content = content+'\n//# sourceURL='+url;
        var script = document.createElement('script');
        script.id = url;
        script.text = content;
        Loader.main.parentNode.appendChild(script);
    }
    static style(url,content) {
        content = content+'\n//# sourceURL='+url;
        var script = document.createElement('style');
        var text = document.createTextNode(content);
        script.id = url;
        script.appendChild(text);
        Loader.main.parentNode.appendChild(script);
    }
    static get scripts(){
        return Object.defineProperty(this,'scripts',{
            value:{}
        }).scripts
    }
    static get main(){
        return Object.defineProperty(this,'main',{
            value:document.querySelector('script[src$="/loader.js"]')
        }).main
    }
    static get base(){
        return Object.defineProperty(this,'base',{
            value:this.main.src.replace(/(.*)\/loader\.js$/,'$1')
        }).base
    }

    static read(url){
        return new Promise((accept,reject)=>{
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET",url);
            xhttp.send();
            xhttp.onload = (e)=>{
                accept(xhttp.responseText);
            };
            xhttp.onerror = (e)=>{
                Loader.scripts[url] = e;
                reject(e)
            };
        })
    }


    static load(files){
        function loadFile(url) {
            if(!Loader.scripts[url]) {
                Loader.scripts[url] = 'loading';
                return Loader.read(url).then(r=>{
                    return Loader.scripts[url] = r;
                })
            }else{
                return Promise.resolve(Loader.scripts[url])
            }
        }
        if(Array.isArray(files)){
            var promise = Promise.resolve();
            files.forEach(f=>{
                promise = promise.then(r=>this.load(f));
            });
            return promise;
        }else{
            var url = this.base+files;
            return loadFile(url).then(content=>{
                if(content){
                    var promise;
                    var imports = content.match(/^\/\/@import\s+(.*)$/mg);
                    if(imports && imports.length){
                        promise = this.load(imports.map(
                            l=>l.replace(/^\/\/@import\s+(.*)$/,'$1')
                        ));
                    }else{
                        promise = Promise.resolve(false);
                    }
                    return promise.then(content=>{
                        if(url.match(/.*\.js$/)){
                            Loader.eval(url,Loader.scripts[url])
                        }else
                        if(url.match(/.*\.css$/)){
                            Loader.style(url,Loader.scripts[url])
                        }
                    })
                }
            })
        }
    }
}
window.addEventListener('load',()=>{
    Loader.eval(Loader.base+'/main.js',Loader.main.text);
});