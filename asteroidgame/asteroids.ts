// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing

/**
 * FIT2102 ASSIGNMENT 1
 * Name: Sulthan De Neiro Raihan Syah Bungin
 * ID: 29906164
 */

/**
 * Function asteroids()
 * 
 * The purpose of this function is to run the asteroids game
 */
function asteroids() {
  /**
   * Creating svg and new element with the group name of "g" and with id "ElemG"
   * 
   * The purpose of the id attribute is to identify when the player hit certain asteroids
   */
  const svg = document.getElementById("canvas")!;
  
  const g = new Elem(svg,'g')
    .attr("transform","translate(300.00 300.00)rotate(0.0000)")  
    .attr("id","ElemG")
  
  /**
   * Creating the player object that is part of g.elem
   * 
   * The main part of the player object is elem "ship" 
   * and the rest of other part are cosmetic(Not necessary for the game to run just to give aesthetic looks)
   * 
   */
  const ship = new Elem(svg, 'polygon', g.elem) 
    .attr("points","-15,20 15,20 0,-15")
    .attr("style","fill:#FFFFFF;stroke:#000000;stroke-width:5")

  const shipPart = new Elem(svg, 'circle',g.elem)
    .attr("cy",0)
    .attr("r",20)
    .attr("style","fill:none;stroke:#8c1717;stroke-width:10")

  const shipPart2 = new Elem(svg, 'circle',g.elem)
    .attr("cy",-30)
    .attr("r",20)
    .attr("style","fill:#000000")

  const shipPart3 = new Elem(svg, 'circle',g.elem)
    .attr("cy",20)
    .attr("r",10)
    .attr("style","fill:#000000")

  /**
   * 2 Functions that will be implemented for game physics 
   *
   * @param rad the radian value that will be changed to Degree
   * @param deg the degree value that will be changed to Radian
   */
  const radToDeg = (rad:number) => rad * 180 / Math.PI + 90
  const degToRad = (deg:number) => (deg-90) * Math.PI / 180

  /* Function that gets the current transform property of the given Elem*/
  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)

  /**
   * The observable that will detect mouseEvent
   *
   */
  const MouseObs = Observable.fromEvent<MouseEvent>(svg, "mousemove")
    /**
     * Calculate the current pointer of the mouse
     */
    .map(({clientX, clientY}) => ({
      lookx: clientX - svg.getBoundingClientRect().left,
      looky: clientY - svg.getBoundingClientRect().top,
      x: transformMatrix(g).m41, 
      y: transformMatrix(g).m42  
    }))
    
    /**
     * 2 Observable to detect if the current mouse location  
     * 
     * The g attribute that being changed is the translate and rotate with and x,y coords that precisely to 5 significant figure
     * (which value can be get from the substring from digit 0 to 6)
     * 
     */
    MouseObs
    .filter(({lookx,looky,x,y}) => (radToDeg(Math.atan2(looky - y, lookx - x)) < 0))
    .map(({lookx, looky, x, y}) => 
      
      /**
       * 360 were added to radToDeg if the value is negative (to make it positive)  
       */
      g.attr("transform",
        "translate(" + x.toPrecision(5).substring(0,6) + " " + y.toPrecision(5).substring(0,6) + ")" +
        "rotate(" + (360 + radToDeg(Math.atan2(looky - y, lookx - x))) + ")"))
    .subscribe(() => {})

      /**
       * if the value is positive there are no value being added    
       */
    MouseObs
    .filter(({lookx,looky,x,y}) => !(radToDeg(Math.atan2(looky - y, lookx - x)) < 0))
    .map(({lookx,looky,x,y}) => {
      g.attr("transform","translate(" + x.toPrecision(5).substring(0,6) + " " + y.toPrecision(5).substring(0,6) + ")" +
              "rotate(" + radToDeg(Math.atan2(looky - y, lookx - x)) + ")")

    })
    .subscribe(()=> {})
  
  /**
   * The observable that responsible for player movement
   * 
   * The movement of the player were detected by keyboard button, which in this case the button that were used
   * are "W"(Ascii of 87) and "E"(Ascii of 69)
   */
  const shipMoveObs = Observable.fromEvent<KeyboardEvent>(document, "keydown")
    .filter(({keyCode}) => keyCode === 87 || keyCode === 69) 
    
    /**
     * .map
     * 
     * to check the x,y value and the rotation of the ship
     * to get the rotation value(rot), the substring of transform (from 31 to 37) were taken
     * 
     */
    .map(()=>({
      x: transformMatrix(g).m41,
      y: transformMatrix(g).m42,
      rot: Number(g.attr("transform").substring(31,37)) 
    }))

    /**
     * 
     * These 4 observables are to check whether or not the ship goes out of the screen from x and y coordinates
     * 
     * If it is the attributed will be changed to make the ship wrap out to other side
     * (E.g. ship goes to left part of the screen goes inside from right part of the screen) 
     * 
     */
    shipMoveObs
    .filter(({x})=>(x > 1500))
    .map(({x,y,rot}) => {
      g.attr("transform","translate("+Number(x - 1550).toPrecision(5).substring(0,6)+" "+Number(y).toPrecision(5).substring(0,6)+")rotate("+rot.toPrecision(5).substring(0,6)+ ")")
    }).subscribe(() =>{})
    
    shipMoveObs
    .filter(({x})=>(x < -100))
    .map(({x,y,rot}) => {
      g.attr("transform","translate("+Number(x + 1550).toPrecision(5).substring(0,6)+" "+Number(y).toPrecision(5).substring(0,6)+")rotate("+rot.toPrecision(5).substring(0,6)+ ")")
    }).subscribe(() =>{})
    
    shipMoveObs
    .filter(({y})=>(y > 700))
    .map(({x,y,rot}) => {
      g.attr("transform","translate("+Number(x).toPrecision(5).substring(0,6)+" "+Number(y-750).toPrecision(5).substring(0,6)+")rotate("+rot.toPrecision(5).substring(0,6)+ ")")
    }).subscribe(() =>{})

    shipMoveObs
    .filter(({y})=>(y < -100))
    .map(({x,y,rot}) => {
      g.attr("transform","translate("+Number(x).toPrecision(5).substring(0,6)+" "+Number(y+750).toPrecision(5).substring(0,6)+")rotate("+rot.toPrecision(5).substring(0,6)+ ")")
    }).subscribe(() =>{})

    shipMoveObs
    .map(({x,y, rot}) => 
      g.attr("transform","translate("+Number(x + 10*Math.cos(degToRad(rot))).toPrecision(5).substring(0,6)+" "+Number(y + 10*Math.sin(degToRad(rot))).toPrecision(5).substring(0,6)+")rotate("+rot.toPrecision(5).substring(0,6) + ")")
      
    ).subscribe(() => {})
    
  /**
   * The observable that responsible to generate bullet object
   *
   * This observable use "Q" (ascii of 81) and "E" (ascii of 69) keys to be triggered
   */  
  const shoot = Observable.fromEvent<KeyboardEvent>(document,"keydown")
    .filter(({keyCode}) => keyCode === 81 || keyCode === 69) //check key "q"

    /**
     * .map
     * 
     * to check the x,y,velocity(v) and the rotation(rot) of the bullet
     * 
     * The bullets will be generated from the center location of the ship
     * and the velocity is a random constant value
     * 
     */
    .map(()=>({
      x: transformMatrix(g).m41, 
      y: transformMatrix(g).m42,
      v : 20,
      rot: Number(g.attr("transform").substring(31,37))
    }))
    /**
     * .map that generate the bullet object
     * 
     * the attribute of the bullet that being changed are
     * "class" (which will be used later on to identify hit detection)
     * "cx" (x value)
     * "cy" (y value)
     * "r" (radius of the bullet)
     * "style" (the appearance of the bullet)
     * "rot" (rotation of the bullet)
     * 
     * As we can see the v value has been passed but not being used in this part of the code
     */
    .map(({x,y,v,rot})=>{
      const bullet = new Elem(svg,"circle")
      .attr("class","b")
      .attr("cx",x)
      .attr("cy",y)
      .attr("r",3)
      .attr("style","fill:none;stroke:#FFFFFF;stroke-width:3")
      .attr("rot",rot)

      /**
       * The observable that responsible for the movement of the bulet
       * 
       * This observable will move the bullet respective to the player direction
       * The v value being used to increase the movement of the bullet
       * After 1 seconds, the bullet will be removed to reduce the lag that being produce
       * 
       */
      Observable.interval(0)
      .takeUntil(Observable.interval(1000))
      .subscribe(()=>{
        bullet.attr("cx", Number(bullet.attr("cx"))+v*Math.cos(degToRad(Number(bullet.attr("rot")))))
        .attr("cy",Number(bullet.attr("cy"))+v*Math.sin(degToRad(Number(bullet.attr("rot")))))
      },() => bullet.elem.remove())
    })
    .subscribe(()=>{})
  
    /**
     * Observable that responsible for the spawning,movement and detection of asteroids
     * 
     * This observable will generate new asteroid every 1 second for 10 seconds
     */
  const spawnAsteroid = Observable.interval(1000).takeUntil(Observable.interval(10000))
    /**
     * The x,y,v,r,rot,id are all based on randomization
     * 
     * The x,y were multiplied by size of screen(1500 for horizontal and 700 for vertical)
     * the velocity(v) were being randomized by constant 3 just to add higher range of velocity and added by 1 so that the object will always move
     * the radius(r) were randomized just to increase diversity of challenge for players and added by 20 so that the radius will always be 20 or more
     * the rotation(rot) were used randomize the rotation of the object
     * the id were randomized just to for the different tag that being added for the hit detection later on
     * 
     */
    .map(()=>({
        x: Math.floor(Math.random()*1500+1),
        y: Math.floor(Math.random()*700+1),
        v: Math.random()*3+1,
        r: Math.random()*50+20,
        rot: Math.random()*360,
        id: String(Math.random())
      }))

      /**
       * Observable that spawn asteroids
       * 
       * the x,y,v,r,rot,id were passed down
       */
      spawnAsteroid
      .map(({x,y,v,r,rot,id})=>{
        const asteroid = new Elem(svg,"circle")
        .attr("cx",x)
        .attr("cy",y)
        .attr("r",r)
        .attr("style","fill:#EDC451")
        .attr("id",id)
      
      
      /**
       * This observable responsible for the movement of the asteroids
       */
      Observable.interval(0)
        .map(()=>{

          /**
           * This codes change the attribute of the newly generated asteroids
           */
          asteroid.attr("cx",Number(asteroid.attr("cx"))+v*Math.cos(rot))
          asteroid.attr("cy",Number(asteroid.attr("cy"))+v*Math.cos(rot))

          /**
           * This observable detect if the player hit the asteroids
           * which will trigger the asteroidEnd() function
           */
          spawnAsteroid
          .filter(({})=>(Math.abs(Number(asteroid.attr("cx"))-Number(g.attr("transform").substring(10,15)))<Number(asteroid.attr("r")))&&
                        (Math.abs(Number(asteroid.attr("cy"))-Number(g.attr("transform").substring(17,22)))<Number(asteroid.attr("r")))&&
                        (document.getElementById(id) != null))
          .subscribe(()=>{
            (svg.remove(),asteroidEnd())
            
          })

          /**
           * These 4 observable are to detect whether or not the asteroid goes out of the screen
           * 
           * Similar to ship mechanism, if the asteroid goes out of the screen it will appear on the edge of the other side of the screen
           */
          spawnAsteroid
          .filter(({v,rot})=>(Number(asteroid.attr("cx"))+v*Math.cos(rot) > 1500))
          .subscribe(()=>{
            asteroid.attr("cx",Number(asteroid.attr("cx"))+v*Math.cos(rot)-1550)
          })

          spawnAsteroid
          .filter(({v,rot})=>(Number(asteroid.attr("cx"))+v*Math.cos(rot) < -100))
          .subscribe(()=>{
            asteroid.attr("cx",Number(asteroid.attr("cx"))+v*Math.cos(rot)+1550)
          })

          spawnAsteroid
          .filter(({v,rot})=>(Number(asteroid.attr("cy"))+v*Math.cos(rot) > 700))
          .subscribe(()=>{
            asteroid.attr("cy",Number(asteroid.attr("cy"))+v*Math.cos(rot)-750)
          })

          spawnAsteroid
          .filter(({v,rot})=>(Number(asteroid.attr("cy"))+v*Math.cos(rot) < -100))
          .subscribe(()=>{
            asteroid.attr("cy",Number(asteroid.attr("cy"))+v*Math.cos(rot)+750)
          })
          
          /**
           * This line of code is just pure cosmetic(No effect on gameplay drastically)
           * 
           * This will change the color of the asteroid randomly
           */
          asteroid.attr("style","fill:#"+Math.round(16777216 * Math.random()).toString(16))

          /**
           * This line of code will try to get the "bullet" object by searching the object that has class "b"
           */
          Array.from(svg.getElementsByClassName("b")).forEach((b) => {

            /**
             * These line of codes will generate the 4 smaller asteroids
             */
            let asteroidA: Elem 
            let asteroidB: Elem
            let asteroidC: Elem 
            let asteroidD: Elem

            /**
             * This terniary operation will detect if the bullet hit the large asteroid
             */
            Math.abs(Number(asteroid.attr("cx"))-Number(b.getAttribute("cx"))) < Number(asteroid.attr("r"))?
            Math.abs(Number(asteroid.attr("cy"))-Number(b.getAttribute("cy"))) < Number(asteroid.attr("r"))?
            (b != null && document.getElementById(id) != null)? 
            /**
             * if its true, then it will delete the asteroid and the bullet and generate 4 different type of asteroids
             * 
             * NOTE: This section of the code can be implemented purely functional with observable .filter and .map however
             * this methods will cause the lag to the game so much that it is better to used terniary operation to control 
             * the mechanism
             */
            (asteroid.elem.remove(),
              b.remove(),
              /**
               * There are 4 different asteroid that generated different offset for each of them with different id for them
               * 
               * This to help identify the bullet detection later on
               */
              asteroidA = new Elem(svg,"circle")
              .attr("id","a"+id)
              .attr("cx",Number(asteroid.attr("cx"))+20)
              .attr("cy",Number(asteroid.attr("cy"))+20)
              .attr("r",Math.random()*10+10)
              .attr("style","fill:#EDC451"),
              asteroidB = new Elem(svg,"circle")
              .attr("id","b"+id)
              .attr("cx",Number(asteroid.attr("cx"))+20)
              .attr("cy",Number(asteroid.attr("cy"))-20)
              .attr("r",Math.random()*10+10)
              .attr("style","fill:#EDC451"),
              asteroidC = new Elem(svg,"circle")
              .attr("id","c"+id)
              .attr("cx",Number(asteroid.attr("cx"))-20)
              .attr("cy",Number(asteroid.attr("cy"))-20)
              .attr("r",Math.random()*10+10)
              .attr("style","fill:#EDC451"),
              asteroidD = new Elem(svg,"circle")
              .attr("id","d"+id)
              .attr("cx",Number(asteroid.attr("cx"))-20)
              .attr("cy",Number(asteroid.attr("cy"))+20)
              .attr("r",Math.random()*10+10)
              .attr("style","fill:#EDC451"),
              /**
               * This observable is responsible for the smaller asteroids movement, wrapping and hit detection
               * 
               * NOTE: These lines of code can be purely implemented with .filter and .map however due to the performance issues
               * these mechanism were implemented with terniary operation
               */
              Observable.interval(0)
              .map(({})=>{
                
                /**
                 * These lines of code will check whether or not the ship object (player) hit the smaller asteroids, if so
                 * then asteroidEnd() will be triggered hence ending the game
                 */
                Math.abs(Number(g.attr("transform").substring(10,15))-Number(asteroidA.attr("cx"))) < Number(asteroidA.attr("r")) ?
                Math.abs(Number(g.attr("transform").substring(17,22))-Number(asteroidA.attr("cy"))) < Number(asteroidA.attr("r")) ? 
                document.getElementById("a"+id) != null ? (svg.remove(),asteroidEnd()) : {} : {} : {}

                Math.abs(Number(g.attr("transform").substring(10,15)) - Number(asteroidB.attr("cx"))) < Number(asteroidB.attr("r")) ?
                Math.abs(Number(g.attr("transform").substring(17,22)) - Number(asteroidB.attr("cy"))) < Number(asteroidB.attr("r")) ? 
                document.getElementById("b"+id) != null ? (svg.remove(),asteroidEnd()) : {} : {} : {}

                Math.abs(Number(g.attr("transform").substring(10,15)) - Number(asteroidC.attr("cx"))) < Number(asteroidC.attr("r")) ?
                Math.abs(Number(g.attr("transform").substring(17,22)) - Number(asteroidC.attr("cy"))) < Number(asteroidC.attr("r")) ? 
                document.getElementById("c"+id) != null ? (svg.remove(),asteroidEnd()) : {} : {} : {}

                Math.abs(Number(g.attr("transform").substring(10,15)) - Number(asteroidD.attr("cx"))) < Number(asteroidD.attr("r")) ?
                Math.abs(Number(g.attr("transform").substring(17,22)) - Number(asteroidD.attr("cy"))) < Number(asteroidD.attr("r")) ? 
                document.getElementById("d"+id) != null ? (svg.remove(),asteroidEnd()) : {} : {} : {}

                /**
                 * These lines of code will check if the smaller asteroids goes out of the bounds
                 * 
                 * Same mechanism with ship and large asteroid
                 * Also the color being randomized were purely cosmetic(No drastic effect to gameplay)
                 */
                asteroidA.attr("cx",Number(asteroidA.attr("cx"))+v*Math.cos(rot*45) > 1550 ? Number(asteroidA.attr("cx"))+v*Math.cos(rot*45)-1600:(Number(asteroidA.attr("cx"))+v*Math.cos(rot*45)))
                asteroidA.attr("cy",Number(asteroidA.attr("cy"))+v*Math.sin(rot*45) > 750 ? Number(asteroidA.attr("cy"))+v*Math.sin(rot*45)-800:(Number(asteroidA.attr("cy"))+v*Math.sin(rot*45)))
                asteroidA.attr("style","fill:#"+Math.round(16777216 * Math.random()).toString(16))

                asteroidB.attr("cx",Number(asteroidB.attr("cx"))+v*Math.cos(rot*135) > 1550 ? Number(asteroidB.attr("cx"))+v*Math.cos(rot*135)-1600:(Number(asteroidB.attr("cx"))+v*Math.cos(rot*135)))
                asteroidB.attr("cy",Number(asteroidB.attr("cy"))+v*Math.sin(rot*135) > 750 ? Number(asteroidB.attr("cy"))+v*Math.sin(rot*135)-800:(Number(asteroidB.attr("cy"))+v*Math.sin(rot*135)))
                asteroidB.attr("style","fill:#"+Math.round(16777216 * Math.random()).toString(16))

                asteroidC.attr("cx",Number(asteroidC.attr("cx"))+v*Math.cos(rot*180) > 1550 ? Number(asteroidC.attr("cx"))+v*Math.cos(rot*180)-1600:(Number(asteroidC.attr("cx"))+v*Math.cos(rot*180)))
                asteroidC.attr("cy",Number(asteroidC.attr("cy"))+v*Math.sin(rot*180) > 750 ? Number(asteroidC.attr("cy"))+v*Math.sin(rot*180)-800:(Number(asteroidC.attr("cy"))+v*Math.sin(rot*180)))
                asteroidC.attr("style","fill:#"+Math.round(16777216 * Math.random()).toString(16))

                asteroidD.attr("cx",Number(asteroidD.attr("cx"))+v*Math.cos(rot*225) > 1550 ? Number(asteroidD.attr("cx"))+v*Math.cos(rot*225)-1600:(Number(asteroidD.attr("cx"))+v*Math.cos(rot*225)))
                asteroidD.attr("cy",Number(asteroidD.attr("cy"))+v*Math.sin(rot*225) > 750 ? Number(asteroidD.attr("cy"))+v*Math.sin(rot*225)-800:(Number(asteroidD.attr("cy"))+v*Math.sin(rot*225)))
                asteroidD.attr("style","fill:#"+Math.round(16777216 * Math.random()).toString(16))
                
                /**
                 * These lines of codes will detect if the bullet hit the smaller asteroids
                 * 
                 * Same mechanism like the large asteroid
                 */
                Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                  Math.abs(Number(asteroidA.attr("cx"))-Number(b.getAttribute("cx"))) < Number(asteroidA.attr("r"))?
                  Math.abs(Number(asteroidA.attr("cy"))-Number(b.getAttribute("cy"))) < Number(asteroidA.attr("r"))?
                  (b != null && document.getElementById("a"+id) != null)? 
                  (asteroidA.elem.remove(),b.remove()):{}:{}:{}
                })

                Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                  Math.abs(Number(asteroidB.attr("cx"))-Number(b.getAttribute("cx"))) < Number(asteroidB.attr("r"))?
                  Math.abs(Number(asteroidB.attr("cy"))-Number(b.getAttribute("cy"))) < Number(asteroidB.attr("r"))?
                  (b != null && document.getElementById("b"+id) != null)? 
                  (asteroidB.elem.remove(),b.remove()):{}:{}:{}
                })

                Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                  Math.abs(Number(asteroidC.attr("cx"))-Number(b.getAttribute("cx"))) < Number(asteroidC.attr("r"))?
                  Math.abs(Number(asteroidC.attr("cy"))-Number(b.getAttribute("cy"))) < Number(asteroidC.attr("r"))?
                  (b != null && document.getElementById("c"+id) != null)? 
                  (asteroidC.elem.remove(),b.remove()):{}:{}:{}
                })

                Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                  Math.abs(Number(asteroidD.attr("cx"))-Number(b.getAttribute("cx"))) < Number(asteroidD.attr("r"))?
                  Math.abs(Number(asteroidD.attr("cy"))-Number(b.getAttribute("cy"))) < Number(asteroidD.attr("r"))?
                  (b != null && document.getElementById("d"+id) != null)? 
                  (asteroidD.elem.remove(),b.remove()):{}:{}:{}
                })

              }).subscribe(()=>{})

            ):{

            }:{

            }:{
              
            }

          })

        })
        .subscribe(()=>{})

      }).subscribe(()=>{}) 


/**
 * Function asteroidEnd()
 * 
 * The purpose of this function is show the end screen of the game
 * This function will be triggered if any of the asteroid hit the player object
 */
function asteroidEnd(){
  document.write("<h1>Game Over</h1><p>Press F5 to restart the game</p>")

}

    
}

// the following simply runs your asteroids function on window load.  Make sure to leave it in place.
if (typeof window != 'undefined')
  window.onload = ()=>{
    asteroids();
  }

 

 
