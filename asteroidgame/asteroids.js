"use strict";
function asteroids() {
    const svg = document.getElementById("canvas");
    const g = new Elem(svg, 'g')
        .attr("transform", "translate(300.00 300.00)rotate(0.0000)")
        .attr("id", "ElemG");
    const ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-15")
        .attr("style", "fill:#FFFFFF;stroke:#000000;stroke-width:5");
    const shipPart = new Elem(svg, 'circle', g.elem)
        .attr("cy", 0)
        .attr("r", 20)
        .attr("style", "fill:none;stroke:#8c1717;stroke-width:10");
    const shipPart2 = new Elem(svg, 'circle', g.elem)
        .attr("cy", -30)
        .attr("r", 20)
        .attr("style", "fill:#000000");
    const shipPart3 = new Elem(svg, 'circle', g.elem)
        .attr("cy", 20)
        .attr("r", 10)
        .attr("style", "fill:#000000");
    const radToDeg = (rad) => rad * 180 / Math.PI + 90;
    const degToRad = (deg) => (deg - 90) * Math.PI / 180;
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    const MouseObs = Observable.fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({
        lookx: clientX - svg.getBoundingClientRect().left,
        looky: clientY - svg.getBoundingClientRect().top,
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42
    }));
    MouseObs
        .filter(({ lookx, looky, x, y }) => (radToDeg(Math.atan2(looky - y, lookx - x)) < 0))
        .map(({ lookx, looky, x, y }) => g.attr("transform", "translate(" + x.toPrecision(5).substring(0, 6) + " " + y.toPrecision(5).substring(0, 6) + ")" +
        "rotate(" + (360 + radToDeg(Math.atan2(looky - y, lookx - x))) + ")"))
        .subscribe(() => { });
    MouseObs
        .filter(({ lookx, looky, x, y }) => !(radToDeg(Math.atan2(looky - y, lookx - x)) < 0))
        .map(({ lookx, looky, x, y }) => {
        g.attr("transform", "translate(" + x.toPrecision(5).substring(0, 6) + " " + y.toPrecision(5).substring(0, 6) + ")" +
            "rotate(" + radToDeg(Math.atan2(looky - y, lookx - x)) + ")");
    })
        .subscribe(() => { });
    const shipMoveObs = Observable.fromEvent(document, "keydown")
        .filter(({ keyCode }) => keyCode === 87 || keyCode === 69)
        .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        rot: Number(g.attr("transform").substring(31, 37))
    }));
    shipMoveObs
        .filter(({ x }) => (x > 1500))
        .map(({ x, y, rot }) => {
        g.attr("transform", "translate(" + Number(x - 1550).toPrecision(5).substring(0, 6) + " " + Number(y).toPrecision(5).substring(0, 6) + ")rotate(" + rot.toPrecision(5).substring(0, 6) + ")");
    }).subscribe(() => { });
    shipMoveObs
        .filter(({ x }) => (x < -100))
        .map(({ x, y, rot }) => {
        g.attr("transform", "translate(" + Number(x + 1550).toPrecision(5).substring(0, 6) + " " + Number(y).toPrecision(5).substring(0, 6) + ")rotate(" + rot.toPrecision(5).substring(0, 6) + ")");
    }).subscribe(() => { });
    shipMoveObs
        .filter(({ y }) => (y > 700))
        .map(({ x, y, rot }) => {
        g.attr("transform", "translate(" + Number(x).toPrecision(5).substring(0, 6) + " " + Number(y - 750).toPrecision(5).substring(0, 6) + ")rotate(" + rot.toPrecision(5).substring(0, 6) + ")");
    }).subscribe(() => { });
    shipMoveObs
        .filter(({ y }) => (y < -100))
        .map(({ x, y, rot }) => {
        g.attr("transform", "translate(" + Number(x).toPrecision(5).substring(0, 6) + " " + Number(y + 750).toPrecision(5).substring(0, 6) + ")rotate(" + rot.toPrecision(5).substring(0, 6) + ")");
    }).subscribe(() => { });
    shipMoveObs
        .map(({ x, y, rot }) => g.attr("transform", "translate(" + Number(x + 10 * Math.cos(degToRad(rot))).toPrecision(5).substring(0, 6) + " " + Number(y + 10 * Math.sin(degToRad(rot))).toPrecision(5).substring(0, 6) + ")rotate(" + rot.toPrecision(5).substring(0, 6) + ")")).subscribe(() => { });
    const shoot = Observable.fromEvent(document, "keydown")
        .filter(({ keyCode }) => keyCode === 81 || keyCode === 69)
        .map(() => ({
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42,
        v: 20,
        rot: Number(g.attr("transform").substring(31, 37))
    }))
        .map(({ x, y, v, rot }) => {
        const bullet = new Elem(svg, "circle")
            .attr("class", "b")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", 3)
            .attr("style", "fill:none;stroke:#FFFFFF;stroke-width:3")
            .attr("rot", rot);
        Observable.interval(0)
            .takeUntil(Observable.interval(1000))
            .subscribe(() => {
            bullet.attr("cx", Number(bullet.attr("cx")) + v * Math.cos(degToRad(Number(bullet.attr("rot")))))
                .attr("cy", Number(bullet.attr("cy")) + v * Math.sin(degToRad(Number(bullet.attr("rot")))));
        }, () => bullet.elem.remove());
    })
        .subscribe(() => { });
    const spawnAsteroid = Observable.interval(1000).takeUntil(Observable.interval(10000))
        .map(() => ({
        x: Math.floor(Math.random() * 1500 + 1),
        y: Math.floor(Math.random() * 700 + 1),
        v: Math.random() * 3 + 1,
        r: Math.random() * 50 + 20,
        rot: Math.random() * 360,
        id: String(Math.random())
    }));
    spawnAsteroid
        .map(({ x, y, v, r, rot, id }) => {
        const asteroid = new Elem(svg, "circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", r)
            .attr("style", "fill:#EDC451")
            .attr("id", id);
        Observable.interval(0)
            .map(() => {
            asteroid.attr("cx", Number(asteroid.attr("cx")) + v * Math.cos(rot));
            asteroid.attr("cy", Number(asteroid.attr("cy")) + v * Math.cos(rot));
            spawnAsteroid
                .filter(({}) => (Math.abs(Number(asteroid.attr("cx")) - Number(g.attr("transform").substring(10, 15))) < Number(asteroid.attr("r"))) &&
                (Math.abs(Number(asteroid.attr("cy")) - Number(g.attr("transform").substring(17, 22))) < Number(asteroid.attr("r"))) &&
                (document.getElementById(id) != null))
                .subscribe(() => {
                (svg.remove(), asteroidEnd());
            });
            spawnAsteroid
                .filter(({ v, rot }) => (Number(asteroid.attr("cx")) + v * Math.cos(rot) > 1500))
                .subscribe(() => {
                asteroid.attr("cx", Number(asteroid.attr("cx")) + v * Math.cos(rot) - 1550);
            });
            spawnAsteroid
                .filter(({ v, rot }) => (Number(asteroid.attr("cx")) + v * Math.cos(rot) < -100))
                .subscribe(() => {
                asteroid.attr("cx", Number(asteroid.attr("cx")) + v * Math.cos(rot) + 1550);
            });
            spawnAsteroid
                .filter(({ v, rot }) => (Number(asteroid.attr("cy")) + v * Math.cos(rot) > 700))
                .subscribe(() => {
                asteroid.attr("cy", Number(asteroid.attr("cy")) + v * Math.cos(rot) - 750);
            });
            spawnAsteroid
                .filter(({ v, rot }) => (Number(asteroid.attr("cy")) + v * Math.cos(rot) < -100))
                .subscribe(() => {
                asteroid.attr("cy", Number(asteroid.attr("cy")) + v * Math.cos(rot) + 750);
            });
            asteroid.attr("style", "fill:#" + Math.round(16777216 * Math.random()).toString(16));
            Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                let asteroidA;
                let asteroidB;
                let asteroidC;
                let asteroidD;
                Math.abs(Number(asteroid.attr("cx")) - Number(b.getAttribute("cx"))) < Number(asteroid.attr("r")) ?
                    Math.abs(Number(asteroid.attr("cy")) - Number(b.getAttribute("cy"))) < Number(asteroid.attr("r")) ?
                        (b != null && document.getElementById(id) != null) ?
                            (asteroid.elem.remove(),
                                b.remove(),
                                asteroidA = new Elem(svg, "circle")
                                    .attr("id", "a" + id)
                                    .attr("cx", Number(asteroid.attr("cx")) + 20)
                                    .attr("cy", Number(asteroid.attr("cy")) + 20)
                                    .attr("r", Math.random() * 10 + 10)
                                    .attr("style", "fill:#EDC451"),
                                asteroidB = new Elem(svg, "circle")
                                    .attr("id", "b" + id)
                                    .attr("cx", Number(asteroid.attr("cx")) + 20)
                                    .attr("cy", Number(asteroid.attr("cy")) - 20)
                                    .attr("r", Math.random() * 10 + 10)
                                    .attr("style", "fill:#EDC451"),
                                asteroidC = new Elem(svg, "circle")
                                    .attr("id", "c" + id)
                                    .attr("cx", Number(asteroid.attr("cx")) - 20)
                                    .attr("cy", Number(asteroid.attr("cy")) - 20)
                                    .attr("r", Math.random() * 10 + 10)
                                    .attr("style", "fill:#EDC451"),
                                asteroidD = new Elem(svg, "circle")
                                    .attr("id", "d" + id)
                                    .attr("cx", Number(asteroid.attr("cx")) - 20)
                                    .attr("cy", Number(asteroid.attr("cy")) + 20)
                                    .attr("r", Math.random() * 10 + 10)
                                    .attr("style", "fill:#EDC451"),
                                Observable.interval(0)
                                    .map(({}) => {
                                    Math.abs(Number(g.attr("transform").substring(10, 15)) - Number(asteroidA.attr("cx"))) < Number(asteroidA.attr("r")) ?
                                        Math.abs(Number(g.attr("transform").substring(17, 22)) - Number(asteroidA.attr("cy"))) < Number(asteroidA.attr("r")) ?
                                            document.getElementById("a" + id) != null ? (svg.remove(), asteroidEnd()) : {} : {} : {};
                                    Math.abs(Number(g.attr("transform").substring(10, 15)) - Number(asteroidB.attr("cx"))) < Number(asteroidB.attr("r")) ?
                                        Math.abs(Number(g.attr("transform").substring(17, 22)) - Number(asteroidB.attr("cy"))) < Number(asteroidB.attr("r")) ?
                                            document.getElementById("b" + id) != null ? (svg.remove(), asteroidEnd()) : {} : {} : {};
                                    Math.abs(Number(g.attr("transform").substring(10, 15)) - Number(asteroidC.attr("cx"))) < Number(asteroidC.attr("r")) ?
                                        Math.abs(Number(g.attr("transform").substring(17, 22)) - Number(asteroidC.attr("cy"))) < Number(asteroidC.attr("r")) ?
                                            document.getElementById("c" + id) != null ? (svg.remove(), asteroidEnd()) : {} : {} : {};
                                    Math.abs(Number(g.attr("transform").substring(10, 15)) - Number(asteroidD.attr("cx"))) < Number(asteroidD.attr("r")) ?
                                        Math.abs(Number(g.attr("transform").substring(17, 22)) - Number(asteroidD.attr("cy"))) < Number(asteroidD.attr("r")) ?
                                            document.getElementById("d" + id) != null ? (svg.remove(), asteroidEnd()) : {} : {} : {};
                                    asteroidA.attr("cx", Number(asteroidA.attr("cx")) + v * Math.cos(rot * 45) > 1550 ? Number(asteroidA.attr("cx")) + v * Math.cos(rot * 45) - 1600 : (Number(asteroidA.attr("cx")) + v * Math.cos(rot * 45)));
                                    asteroidA.attr("cy", Number(asteroidA.attr("cy")) + v * Math.sin(rot * 45) > 750 ? Number(asteroidA.attr("cy")) + v * Math.sin(rot * 45) - 800 : (Number(asteroidA.attr("cy")) + v * Math.sin(rot * 45)));
                                    asteroidA.attr("style", "fill:#" + Math.round(16777216 * Math.random()).toString(16));
                                    asteroidB.attr("cx", Number(asteroidB.attr("cx")) + v * Math.cos(rot * 135) > 1550 ? Number(asteroidB.attr("cx")) + v * Math.cos(rot * 135) - 1600 : (Number(asteroidB.attr("cx")) + v * Math.cos(rot * 135)));
                                    asteroidB.attr("cy", Number(asteroidB.attr("cy")) + v * Math.sin(rot * 135) > 750 ? Number(asteroidB.attr("cy")) + v * Math.sin(rot * 135) - 800 : (Number(asteroidB.attr("cy")) + v * Math.sin(rot * 135)));
                                    asteroidB.attr("style", "fill:#" + Math.round(16777216 * Math.random()).toString(16));
                                    asteroidC.attr("cx", Number(asteroidC.attr("cx")) + v * Math.cos(rot * 180) > 1550 ? Number(asteroidC.attr("cx")) + v * Math.cos(rot * 180) - 1600 : (Number(asteroidC.attr("cx")) + v * Math.cos(rot * 180)));
                                    asteroidC.attr("cy", Number(asteroidC.attr("cy")) + v * Math.sin(rot * 180) > 750 ? Number(asteroidC.attr("cy")) + v * Math.sin(rot * 180) - 800 : (Number(asteroidC.attr("cy")) + v * Math.sin(rot * 180)));
                                    asteroidC.attr("style", "fill:#" + Math.round(16777216 * Math.random()).toString(16));
                                    asteroidD.attr("cx", Number(asteroidD.attr("cx")) + v * Math.cos(rot * 225) > 1550 ? Number(asteroidD.attr("cx")) + v * Math.cos(rot * 225) - 1600 : (Number(asteroidD.attr("cx")) + v * Math.cos(rot * 225)));
                                    asteroidD.attr("cy", Number(asteroidD.attr("cy")) + v * Math.sin(rot * 225) > 750 ? Number(asteroidD.attr("cy")) + v * Math.sin(rot * 225) - 800 : (Number(asteroidD.attr("cy")) + v * Math.sin(rot * 225)));
                                    asteroidD.attr("style", "fill:#" + Math.round(16777216 * Math.random()).toString(16));
                                    Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                                        Math.abs(Number(asteroidA.attr("cx")) - Number(b.getAttribute("cx"))) < Number(asteroidA.attr("r")) ?
                                            Math.abs(Number(asteroidA.attr("cy")) - Number(b.getAttribute("cy"))) < Number(asteroidA.attr("r")) ?
                                                (b != null && document.getElementById("a" + id) != null) ?
                                                    (asteroidA.elem.remove(), b.remove()) : {} : {} : {};
                                    });
                                    Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                                        Math.abs(Number(asteroidB.attr("cx")) - Number(b.getAttribute("cx"))) < Number(asteroidB.attr("r")) ?
                                            Math.abs(Number(asteroidB.attr("cy")) - Number(b.getAttribute("cy"))) < Number(asteroidB.attr("r")) ?
                                                (b != null && document.getElementById("b" + id) != null) ?
                                                    (asteroidB.elem.remove(), b.remove()) : {} : {} : {};
                                    });
                                    Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                                        Math.abs(Number(asteroidC.attr("cx")) - Number(b.getAttribute("cx"))) < Number(asteroidC.attr("r")) ?
                                            Math.abs(Number(asteroidC.attr("cy")) - Number(b.getAttribute("cy"))) < Number(asteroidC.attr("r")) ?
                                                (b != null && document.getElementById("c" + id) != null) ?
                                                    (asteroidC.elem.remove(), b.remove()) : {} : {} : {};
                                    });
                                    Array.from(svg.getElementsByClassName("b")).forEach((b) => {
                                        Math.abs(Number(asteroidD.attr("cx")) - Number(b.getAttribute("cx"))) < Number(asteroidD.attr("r")) ?
                                            Math.abs(Number(asteroidD.attr("cy")) - Number(b.getAttribute("cy"))) < Number(asteroidD.attr("r")) ?
                                                (b != null && document.getElementById("d" + id) != null) ?
                                                    (asteroidD.elem.remove(), b.remove()) : {} : {} : {};
                                    });
                                }).subscribe(() => { })) : {} : {} : {};
            });
        })
            .subscribe(() => { });
    }).subscribe(() => { });
    function asteroidEnd() {
        document.write("<h1>Game Over</h1><p>Press F5 to restart the game</p>");
    }
}
if (typeof window != 'undefined')
    window.onload = () => {
        asteroids();
    };
//# sourceMappingURL=asteroids.js.map