var exec = require('child_process').exec
var dedent = require('dedent')
var mkdirp = require('mkdirp')
var path = require('path')
var pump = require('pump')
var fs = require('fs')

exports.mkdir = function (dir, cb) {
  mkdirp(dir, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dir))
    fs.readdir(dir, function (err, files) {
      if (err) return cb(new Error('Could not read directory ' + dir))
      if (files.length) return cb(new Error('Directory contains files. This might create conflicts.'))
      cb()
    })
  })
}

exports.writePackage = function (dir, cb) {
  var filename = path.join(dir, 'package.json')
  var name = path.basename(dir)
  var file = dedent`
  {
    "name": "${name}",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "build": "bankai build index.js",
      "create": "choo-scaffold",
      "inspect": "bankai inspect index.js",
      "start": "bankai start index.js",
      "test": "standard && npm run test-deps",
      "test-deps": "dependency-check . && dependency-check . --extra --no-dev -i tachyons"
    }
  }
  `
  write(filename, file, cb)
}

exports.writeIgnore = function (dir, cb) {
  var filename = path.join(dir, '.gitignore')
  var file = dedent`
    node_modules/
    .nyc_output/
    coverage/
    dist/
    tmp/
    npm-debug.log*
    .DS_Store
  `

  write(filename, file, cb)
}

exports.writeReadme = function (dir, description, cb) {
  var filename = path.join(dir, 'README.md')
  var name = path.basename(dir)
  var file = dedent`
    # ${name}
    ${description}

    ## Commands
    Command                | Description                                      |
    -----------------------|--------------------------------------------------|
    \`$ npm start\`          | Start the development server
    \`$ npm test\`           | Lint, validate deps & run tests
    \`$ npm run build\`      | Compile all files into \`dist/\`
    \`$ npm run create\`     | Generate a scaffold file
    \`$ npm run inspect\`    | Inspect the bundle's dependencies
  `

  write(filename, file, cb)
}

exports.writeIndex = function (dir, cb) {
  var filename = path.join(dir, 'index.js')
  var file = dedent`
    var css = require('sheetify')
    var choo = require('choo')

    css('ress')
    css('./assets/css/gr8.js')
    css('./assets/css/base.css')


    var app = choo()
    if (process.env.NODE_ENV !== 'production') {
      app.use(require('choo-devtools')())
    }

    app.route('/', require('./views/main'))
    app.route('/*', require('./views/404'))

    module.exports = app.mount('body')\n
  `

  write(filename, file, cb)
}

exports.writeManifest = function (dir, description, cb) {
  var filename = path.join(dir, 'manifest.json')
  var name = path.basename(dir)
  var file = dedent`
    {
      "name": "${name}",
      "short_name": "${name}",
      "description": "${description}",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#000",
      "theme_color": "#000",
      "icons": [{
        "src": "/assets/icon.png",
        "type": "image/png",
        "sizes": "512x512"
      }]
    }
  `

  write(filename, file, cb)
}

exports.writeNotFoundView = function (dir, cb) {
  var dirname = path.join(dir, 'views')
  var filename = path.join(dirname, '404.js')
  var projectname = path.basename(dir)
  var file = dedent`
    var html = require('choo/html')

    var TITLE = '${projectname} - route not found'

    module.exports = view

    function view (state, emit) {
      if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
      return html\`
        <body class="ff-sans">
          <h1>Route not found.</h1>
          <a href="/">Back to main.</a>
        </body>
      \`
    }\n
  `

  mkdirp(dirname, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dirname))
    write(filename, file, cb)
  })
}

exports.writeBaseCSS = function (dir, cb) {
  var dirname = path.join(dir, 'assets', 'css')
  var filename = path.join(dirname, 'base.css')
  var projectname = path.basename(dir)
  var file = dedent`
    html {
      font-size: 16px;
      font-weight: 400;
      line-height: 1.2;
    }

    h1, h2, h3, h4, h5, h6, h7 {
      font-size: inherit;
      font-weight: inherit;
      font-style: inherit;
      margin-bottom: 1.2rem;
    }

    button, input {
      outline: none;
    }
    ul, ol, li {
      list-style: none;
    }

    ul, ol {
      margin-bottom: 1.2rem;
    }

    a {
      color: inherit;
      text-decoration: inherit;
    }

    p {
      margin-bottom: 1.2rem;
      hyphens: auto;
    }

    table {
      border-collapse: collapse;
    }

    button {
      background: none !important;
      color: inherit;
      border: none;
      padding: 0 !important;
      font: inherit;
      cursor: pointer;
    }

    img {
      max-width: 100%;
    }\n
  `

  mkdirp(dirname, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dirname))
    write(filename, file, cb)
  })
}

exports.writeGr8CSS = function (dir, cb) {
  var dirname = path.join(dir, 'assets', 'css')
  var filename = path.join(dirname, 'gr8.js')
  var projectname = path.basename(dir)
  var file = dedent`
    var gr8 = require('gr8')

    var opts = {
      breakpointSelector: 'class',
      utils: []
    }

    var colors = {
      black: '#000',
      white: '#fff'
    }

    var borderWeights = [1]

    var borders = {}

    for (var weight of borderWeights) {
      for (var color in colors) {
        borders[weight + '-' + color] = \`\${weight}px solid \${colors[color]}\`
      }
    }

    opts.utils.push({
      prop: [
        'border',
        'border-top',
        'border-right',
        'border-bottom',
        'border-left'
      ],
      vals: borders
    })

    opts.utils.push({
      prop: { bgc: 'background-color' },
      join: '-',
      vals: colors
    })

    opts.utils.push({
      prop: 'color',
      join: '-',
      vals: colors
    })

    opts.utils.push({
      prop: 'font-family',
      join: '-',
      vals: {
        sans: \`-apple-system, BlinkMacSystemFont, 'avenir next', avenir, 'helvetica neue', helvetica, ubuntu, roboto, noto, 'segoe ui', arial, sans-serif\`,
        serif: \`'Times New Roman', serif\`
      }
    })

    opts.utils.push({
      prop: {
        mx: 'max-width',
        my: 'max-height'
      },
      unit: '%',
      vals: [100]
    })

    opts.utils.push({
      prop: 'text-decoration',
      vals: {
        'u-hover': 'underline',
        'o-hover': 'overline',
        'lt-hover': 'line-through',
        'n-hover': 'none'
      },
      tail: ':hover'
    })

    module.exports = gr8(opts)\n
  `

  file = file.replace(/\\\$/g, '$')

  mkdirp(dirname, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dirname))
    write(filename, file, cb)
  })
}

exports.writeMainView = function (dir, cb) {
  var dirname = path.join(dir, 'views')
  var filename = path.join(dirname, 'main.js')
  var projectname = path.basename(dir)
  var file = dedent`
    var html = require('choo/html')

    var TITLE = '${projectname} - main'

    module.exports = view

    function view (state, emit) {
      if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

      return html\`
        <body class="ff-sans">
        </body>
      \`
    }\n
  `

  mkdirp(dirname, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dirname))
    write(filename, file, cb)
  })
}

exports.writeIcon = function (dir, cb) {
  var iconPath = path.join(__dirname, 'assets/icon.png')
  var dirname = path.join(dir, 'assets')
  var filename = path.join(dirname, 'icon.png')
  mkdirp(dirname, function (err) {
    if (err) return cb(new Error('Could not create directory ' + dirname))
    var source = fs.createReadStream(iconPath)
    var sink = fs.createWriteStream(filename)
    pump(source, sink, function (err) {
      if (err) return cb(new Error('Could not write file ' + filename))
      cb()
    })
  })
}

exports.install = function (dir, packages, cb) {
  packages = packages.join(' ')
  var cmd = 'npm install --save --loglevel error ' + packages
  var popd = pushd(dir)
  exec(cmd, {env: process.env}, function (err) {
    if (err) return cb(new Error(cmd))
    popd()
    cb()
  })
}

exports.devInstall = function (dir, packages, cb) {
  packages = packages.join(' ')
  var cmd = 'npm install --save-dev --loglevel error ' + packages
  var popd = pushd(dir)
  exec(cmd, {env: process.env}, function (err) {
    if (err) return cb(new Error(cmd))
    popd()
    cb()
  })
}

exports.createGit = function (dir, message, cb) {
  var init = 'git init'
  var add = 'git add -A'
  var config = 'git config user.email'
  var commit = 'git commit -m "' + message + '"'

  var popd = pushd(dir)
  exec(init, function (err) {
    if (err) return cb(new Error(init))

    exec(add, function (err) {
      if (err) return cb(new Error(add))

      exec(config, function (err) {
        if (err) return cb(new Error(config))

        exec(commit, function (err) {
          if (err) return cb(new Error(commit))
          popd()
          cb()
        })
      })
    })
  })
}

function pushd (dir) {
  var prev = process.cwd()
  process.chdir(dir)
  return function popd () {
    process.chdir(prev)
  }
}

function write (filename, file, cb) {
  fs.writeFile(filename, file, function (err) {
    if (err) return cb(new Error('Could not write file ' + filename))
    cb()
  })
}
