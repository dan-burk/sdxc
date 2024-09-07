# sdxc - Talk to your data via AI
Hosted at [sdxc.ai](https://sdxc.ai).  Contact Daniel Burkhalter.

sdxc is an app that analyzes SD High School XC Rankings.

## Installation
This repository is updated frequently. We suggest users reinstall everytime before using it, so that you always have the most recent version.

1. Update R and RStudio to the most recent version. 
2. Install the sdxc package
``` r
if (!require("remotes")) {
  install.packages("remotes")
}
library(remotes)
install_github("dan-burk/sdxc")
```

## To start sdxc
```{r example}
library(sdxc)
run_app()
```
## License
(MIT) Use however you want.


