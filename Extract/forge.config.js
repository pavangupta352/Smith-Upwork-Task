module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
	{
	  name: '@electron-forge/maker-wix',
	  config: {
		language: 1033,
		manufacturer: 'Auto PDF Extract',
	  }
	}	
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
	publishers: [
/*		{
			name: '@electron-forge/publisher-s3',
			config: {
				bucket: 'auto-pdf-extract',
				public: true
			}
		},*/
/*		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'hobrahim',
					name: 'auto-pdf-extract'
				},
				prerelease: true
			}
		}*/		
	]  
};
