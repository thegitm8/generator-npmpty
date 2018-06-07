const Generator = require('yeoman-generator');
const https = require('https')

function getNodeVersions() {
  return new Promise((resolve, reject) => {
    https.get('https://nodejs.org/dist/index.json', resp => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        const parsed = JSON.parse(data)
        const nodeVersionLatest = { version, npm } = parsed[0]//.version.slice(1)
        const nodeVersionLTS = parsed.find(v => v.lts)//.version.slice(1)

        resolve({
          nodeVersionLatest: {
            node: nodeVersionLatest.version.slice(1),
            npm: nodeVersionLatest.npm
          },
          nodeVersionLTS: {
            node: nodeVersionLTS.version.slice(1),
            npm: nodeVersionLTS.npm
          }
        })
      });
    }).on("error", reject);
  })
}

module.exports = class extends Generator {

  async initializing() {

    const { nodeVersionLatest, nodeVersionLTS } = await getNodeVersions()

    this.nodeVersionLatest = nodeVersionLatest
    this.nodeVersionLTS = nodeVersionLTS
    this.githubUserName = await this.user.github.username()
  }

  async prompting() {
    const input = await this.prompt([
      {
        type: 'input',
        name: 'libraryName',
        message: `Your project name (${this.appname})`,
        default: this.appname
      },
      {
        type: 'input',
        name: 'libraryDescription',
        message: 'Describe your library',
      },
      {
        type: 'input',
        name: 'authorName',
        message: `Your name (${this.githubUserName})`,
        default: this.githubUserName
      },
      {
        type: 'input',
        name: 'libraryLicense',
        message: 'Library license (Apache-2.0)',
        default: 'Apache-2.0'
      },
      {
        type: 'input',
        name: 'githubUserName',
        message: `github user name (${this.githubUserName})`,
        default: this.githubUserName
      }
    ])

    this.libraryName = input.libraryName
    this.libraryDescription = input.libraryDescription
    this.authorName = input.authorName
    this.libraryLicense = input.libraryLicense
    this.githubUserName = input.githubUserName
  }

  copyPackageJson() {
    this.fs.copyTpl(
      this.templatePath('_package.json'),
      this.destinationPath('package.json'),
      {
        name: this.libraryName,
        license: this.libraryLicense,
        description: this.libraryDescription,
        author: this.authorName,
        githubUserName: this.githubUserName,
        githubEmail: this.user.git.email(),
        engineNodeVersion: this.nodeVersionLTS.node,
        engineNpmVersion: this.nodeVersionLTS.npm
      }
    );
  }

  copyEslint() {
    this.fs.copyTpl(
      this.templatePath('_eslintrc'),
      this.destinationPath('.eslintrc')
    )
  }

  copyReleaserc() {
    this.fs.copyTpl(
      this.templatePath('_releaserc.json'),
      this.destinationPath('.releaserc.json')
    )
  }

  copyGitignore() {
    this.fs.copyTpl(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore')
    )
  }

  copyNpmignore() {
    this.fs.copyTpl(
      this.templatePath('_npmignore'),
      this.destinationPath('.npmignore')
    )
  }

  copyTravis() {
    this.fs.copyTpl(
      this.templatePath('_travis.yml'),
      this.destinationPath('.travis.yml')
    )
  }

  end() {
    // this.npmInstall([
    //   'eslint',
    //   'eslint-config-airbnb-base',
    //   'eslint-plugin-import',
    //   'mocha'
    // ], { skipMessage: true })
  }

};
