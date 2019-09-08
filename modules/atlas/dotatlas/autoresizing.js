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

/**
 * A dotAtlas extension that resizes the visualization when browser
 * window changes its size.
 */
export const AutoResizing = {
  create: (delegate, options) => {
    window.addEventListener("resize", (function () {
      let timeout;
      return function () {
        // Basic resizing is fast, no need for throttling.
        delegate.resize();

        // Resizing also requires updating label layout,
        // this bit takes a little longer, so throttle those
        // specific calls.
        const labelLayers = getLayersOfType("label");
        if (labelLayers.length > 0) {
          window.clearTimeout(timeout);
          timeout = window.setTimeout(function () {
            for (let labels of labelLayers) {
              labels.update("labelVisibilityScales");
            }
            delegate.redraw();
          }, 300);
        }
      };
    })());

    // return DotAtlas.injectApiProxy({}, delegate, this, options, {});

    function getLayersOfType(type) {
      return delegate.get("layers").filter(l => l.get("type") === type);
    }
  }
};
