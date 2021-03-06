app
  .factory('fbutil', ['$window', 'FBURL', '$q', function ($window, FBURL, $q) {
    var utils = {
      // convert a node or Firebase style callback to a future
      handler(fn, context) {
        return utils.defer((def) => {
          fn.call(context, (err, result) => {
            if (err !== null) { def.reject(err); } else { def.resolve(result); }
          });
        });
      },

      // abstract the process of creating a future/promise
      defer(fn, context) {
        const def = $q.defer();
        fn.call(context, def);
        return def.promise;
      },

      ref: firebaseRef,
    };

    return utils;

    function pathRef(args) {
      for (let i = 0; i < args.length; i++) {
        if (angular.isArray(args[i])) {
          args[i] = pathRef(args[i]);
        } else if (typeof args[i] !== 'string') {
          throw new Error(`Argument ${i} to firebaseRef is not a string: ${args[i]}`);
        }
      }
      return args.join('/');
    }

    /**
     * Example:
     * <code>
     *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
     * </code>
     *
     * @function
     * @name firebaseRef
     * @param {String|Array...} path relative path to the root folder in Firebase instance
     * @return a Firebase instance
     */
    function firebaseRef(path) {
      let ref = new $window.Firebase(FBURL);
      const args = Array.prototype.slice.call(arguments);
      if (args.length) {
        ref = ref.child(pathRef(args));
      }
      return ref;
    }
  }]);
