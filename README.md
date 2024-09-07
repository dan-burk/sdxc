# sdxc.ai - Talk to your data via AI
Hosted at [sdxc.ai](https://sdxc.ai).  Contact Steven Ge on [LinkedIn](https://www.linkedin.com/in/steven-ge-ab016947/) or [Twitter.](https://twitter.com/StevenXGe)

sdxc is an AI-based app that can quickly generate and test R code. Powered by API calls to OpenAI's ChatGPT or other models, sdxc translates natural languages into R scripts, which are then executed within the Shiny platform. An R Markdown source file and HTML report can be generated. 
## Video tutorial
Highly recommend users to watch this 10-min [YouTube video.](https://youtu.be/a-bZW26nK9k)
## What's new
1.  GPT-4 becomes the default, providing more accurate code.
2.  Comprehensive EDA reports.
3.  Chat window that helps explain code, result, error messages, and statistics in general. This makes sdxc a great platform for learning R and statistics.

## Installation
This repository is updated frequently, sometimes a few times a day. We suggest users reinstall everytime before using it, so that you always have the most recent version.

1. Update R and RStudio to the most recent version. 
2. Install the sdxc package
``` r
if (!require("remotes")) {
  install.packages("remotes")
}
library(remotes)
#voice input package heyshiny
install_github("jcrodriguez1989/heyshiny", dependencies = TRUE)
install_github("gexijin/sdxc")
```
3. Install other R packages. If you want to use additional R package for analyzing your data, you should install these in your computer too.
## Obtain an API key from OpenAI
1.  Create a personal account at [OpenAI](https://openai.com/api/).
2.  After logging in, click on **Personal** from top left.
3.  Click **Manage Account** and then **Billing**, where you can add **Payment methods** and set **Usage limits**. $3-$5 per month is more than enough for most people.
4. Click on **API keys** to create a new key, which can be copied.

## Use the API key with sdxc
There are several ways to do this. 
- After the app is started, you can click on **Settings** and paste the API key.
- You can also save this key as a text file called **api_key.txt** in the working directory. 
- Finally, you can create an environment variable called **OPEN_API_KEY**. Instructions for [Windows](https://docs.oracle.com/en/database/oracle/machine-learning/oml4r/1.5.1/oread/creating-and-modifying-environment-variables-on-windows.html), 
[Mac](https://phoenixnap.com/kb/set-environment-variable-mac), and 
[Linux](https://linuxize.com/post/how-to-set-and-list-environment-variables-in-linux/). 

## To start sdxc
```{r example}
library(sdxc)
run_app()
```
## License
(CC BY-NC 3.0) Non-commercial use.

## Examples
See this **[report](https://htmlpreview.github.io/?https://raw.githubusercontent.com/gexijin/sdxc/main/vignettes/Example_report.html)** generated by sdxc after in a typical session. 

sdxc also generates [comprehensive reports](https://htmlpreview.github.io/?https://github.com/gexijin/gEDA/blob/main/example_report.html) for exploratory data analysis (EDA). 

