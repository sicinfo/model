/**
 * applicatiion: lib/model
 */

(root, factory => {
  define(['asmore-id', 'model'], ({ newId }) => {


    return factory(root, a => `${a}_${newId()}`);


  })(this || self || window, (root, uniqueId) => urlBase => urlArg => {

    class Model {

      constructor(attrs, options = {}) {
        this.cidPrefix = options.cidPrefix || 'm';
        this.cid = uniqueId(this.cidPrefix);
        this.attributes = {};
        options.Collection && (this.Collection = options.Collection);
        options.parse && (attrs = this.parse(attrs, options) || {});
        this.idAttribute = options.idAttribute || 'id';
        this.defaults = options.defaults || {};
        this.set(Object.assign({}, this.defaults, attrs), options);
        this.changed = {};
      }

      _validate(attrs, options) {
        if (!options.validate || !this.validate) return true
      }

      set(attrs, val, options = {}) {

        if ('object' == typeof (attrs)) options = val;
        else (key => (attrs = {})[key] = val)(attrs);

        if (!this._validate(attrs, options)) {
          return false
        }

        this._previousAttributes = Object.assign(this.attributes);
        this.changed = {};

        const unset = options.unset;
        const current = this.attributes;
        const changed = this.changed;
        const prev = this._previousAttributes;

        Object.keys(attrs).some(attr => {
          let val = attrs[attr];

          prev[attr] == val ?
            delete changed[attr] :
            changed[attr] = val;

          unset ?
            delete current[attr] :
            current[attr] === val || (
              current[attr] = val
            );

        })

        this.idAttribute in attrs && (
          this.id = this.get(this.idAttribute)
        );

        return this;
      }

      unset(attr, options) {
        return this.set(attr, void 0, Object.assign({}, options, { 'unset': true }))
      }

      clear(options) {
        const attrs = {};
        Object.keys(this.attributes).some(attr => { attrs[attr] = void 0 })
        return this.set(attrs, Object.assign({}, options, { 'unset': true }))
      }

      hasChanged(attr) {
        return attr == null ?
          !!Object.keys(this.changed).length :
          attr in this.changed
      }

      changedAttributes() {
        return this.hasChanged() && Object.assign(this.changed)
      }

      get(attr) {
        return this.attributes[attr]
      }

      has(attr) {
        return attr in this.attributes
      }

      urlRoot() {
        return `${urlBase}/${urlArg}/${this.get(this.idAttribute)}`
      }

      toJSON(options) {
        return Object.assign(this.attributes);
      }

      parse(resp, opts) {
        return resp
      }

      fetch(options) {

        let model = this;
        options = Object.assign({ 'parse': true }, options);

        return new Promise((resolve, reject) => {

          if (options.data) {
            model.attributes = Object.assign(model.attributes, options.data)
          }

          if (!model.has(model.idAttribute)) {
            return reject({ 'error': 'chave não definida para url' })
          }

          root.fetch(model.urlRoot(), {})
            .then(response => {
              const attrs = options.parse ? model.parse(response, options) : response;
              model.set(attrs, options) || reject({ 'error': 'dados do servidor invalidos' });
              resolve({ model, response, options })
            })

        });


      }

    }



    class Collection { }



    return { Collection, Model }
  })