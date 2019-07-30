/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 * Copyright 2002-@current.year@, Carrot Search s.c.
 */
const DotAtlasEffects = function (dotAtlas) {
  const Tween = /** @constructor */ function(config) {
    const duration = config.duration;
    const step = config.step;
    const complete = config.complete;
    const easing = config.easing || function (x) { return x };

    const props = Object.keys(config.from);
    const state = Object.assign({}, config.from);
    const from  = Object.assign({}, config.from);
    const to    = Object.assign({}, config.to);

    let startTime, running = false;

    this.start = function() {
      let allEqual = true;
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (from[prop] !== to[prop]) {
          allEqual = false;
          break;
        }
      }
      if (allEqual) {
        return;
      }

      // TODO: Check if performance.now() is supported
      startTime = window.performance.now();
      if (!running) {
        running  = true;
        window.requestAnimationFrame(function makeStep(now) {
          const p = Math.max(0, Math.min(1.0, (now - startTime) / duration));
          const progress = easing(p);

          for (let i = 0; i < props.length; i++) {
            const prop = props[i];
            const fromValue = from[prop];
            state[prop] = fromValue + progress * (to[prop] - fromValue);
          }
          step(state, p);

          if (progress < 1) {
            window.requestAnimationFrame(makeStep);
          } else {
            running = false;
            window.requestAnimationFrame(function () {
              complete && complete(state);
            });
          }
        });
      }
    };
  };

  const sine = function (x) {
    return (Math.sin(Math.sqrt(x) * Math.PI / 2));
  };

  const cosine = function (x) {
    if (x >= 1) {
      return 1;
    }
    return (1 - Math.cos(x * x * Math.PI / 2));
  };


  this.rollout = function (dataObject) {
    return new Promise(function (resolve) {
      const markerSizeMultiplier = dotAtlas.get("markerSizeMultiplier");

      dotAtlas.set({
        labelOpacity: 0,
        mapElevationOffset: -1,
        markerSizeMultiplier: 0,
        dataObject: dataObject
      });

      const duration = 500;

      let labelTweenStarted = false;
      let markerTweenStarted = false;
      return new Tween({
        duration: duration,
        easing: sine,
        from: { mapElevationOffset: -1 },
        to: { mapElevationOffset: 0 },
        step: function (state, progress) {
          dotAtlas.set(state);
          dotAtlas.redraw();

          if (progress >= 0.65 && !markerTweenStarted) {
            markerTweenStarted = true;
            new Tween({
              duration: 0.8 * duration,
              from: { markerSizeMultiplier: 0 },
              to: { markerSizeMultiplier: markerSizeMultiplier },
              step: function (state, progress) {
                dotAtlas.set(state);
                dotAtlas.redraw();

                if (progress >= 0.5 && !labelTweenStarted) {
                  labelTweenStarted = true;
                  new Tween({
                    duration: 0.8 * duration,
                    from: { labelOpacity: 0, },
                    to: { labelOpacity: 1 },
                    step: function (state) {
                      dotAtlas.set(state);
                      dotAtlas.redraw();
                    }
                  }).start();
                }
              }
            }).start();
          }
        }
      }).start();
    });
  };

  this.pullback = function () {
    const duration = 500;

    return new Promise(function (resolve) {
      let elevationTweenStarted = false;
      const markerSizeMultiplier = dotAtlas.get("markerSizeMultiplier");

      new Tween({
        duration: duration,
        from: { labelOpacity: 1, markerSizeMultiplier: markerSizeMultiplier },
        to: { labelOpacity: 0, markerSizeMultiplier: 0 },
        step: function (state, progress) {
          dotAtlas.set(state);
          dotAtlas.redraw();

          if (progress >= 0.35 && !elevationTweenStarted) {
            elevationTweenStarted = true;

            new Tween({
              duration: duration,
              easing: cosine,
              from: { mapElevationOffset: 0 },
              to: { mapElevationOffset: -1 },
              step: function (state) {
                dotAtlas.set(state);
                dotAtlas.redraw();
              },
              complete: function () {
                dotAtlas.set("markerSizeMultiplier", markerSizeMultiplier);
                resolve();
              }
            }).start()
          }
        }
      }).start();
    });
  };

  this.replace = function (newDataObject) {
    const currentDataObject = dotAtlas.get("dataObject");
    if (currentDataObject && currentDataObject.points && currentDataObject.points.length > 0) {
      return this.pullback().then(function () {
        return this.rollout(newDataObject);
      }.bind(this));
    } else {
      return this.rollout(newDataObject);
    }
  };
};