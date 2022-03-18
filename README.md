
# Welcome to GreenIDE

  

## What is GreenIDE?
GreenIDE is extension developed to work with Visual Studio Code, in effort to help software developers understand and reduce power consumption of every code line. This extension will take configurations of a software into consideration to put out direct feedback on how much time would one specific function to execute, as well of how power consuming the function is, therefore developers can make necessary changes to reduce how much energy a program would cost.
  
## Functions
- GreenIDE can identify hotspot code, where a function with a specific configuration would require much more energy than average.
- By hovering your click point on a function of your choice, you would know how much energy is needed for the execution and how long would it take.
- You can change a program's configuration by editing the configuration file.
- The colors of the messages you receive are adapted to your theme, whereas it is dark mode or normal mode.

## Setting up and how to use
- To download the current extension, go to the pipelines and open up the package_extension job
- Then click on download to download the job artifact
- The downloaded ZIP-Folder contains the .vsix extension file
- In Visual Studio  go to the "extension" window (menu on the left) and click on the three dots in the top right corner
- Then you can click on "Install from VSIX" and select the downloaded .vsix file
- Now the extension is installed and you can run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `greenide.init`.
- It's all set and done! You are good to go. Now just hover on a function of your choice to see the energy consumption level, execution time and if it is a hotspot code or not
  
## How to debug the extension
- First, you would need to open up the folder `frontend/greenide` directly in Visual Studio Code (File -> Open Folder)
- Then open the file `extension.ts` 
- Press `F5` to open a new window with your extension loaded
- Open your codes on this new window
-  Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `greenide.init`.
- It's all set and done! You are good to go. Now just hover on a function of your choice to see the energy consumption level, execution time and if it is a hotspot code or not


## Release notes
### 1.0.0
Initial release of GreenIDE

  





  
