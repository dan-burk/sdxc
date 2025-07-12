

df_points_boys_list <- readRDS("C:/Users/Daniel/OneDrive - South Dakota State University - SDSU/Documents/School/STAT 651/XC Ranking/XC Ranking App/sdxc-basic/df_points_boys_list.rds")
df_points_girls_list <- readRDS("C:/Users/Daniel/OneDrive - South Dakota State University - SDSU/Documents/School/STAT 651/XC Ranking/XC Ranking App/sdxc-basic/df_points_girls_list.rds")
schools <- readRDS("C:/Users/Daniel/OneDrive - South Dakota State University - SDSU/Documents/School/STAT 651/XC Ranking/XC Ranking App/sdxc-basic/list_schools.rds")

library(dplyr)
for(i in 1:7) {
  # Boys data
  jsonlite::write_json(
    df_points_boys_list[[i]], 
    paste0("boys_2023_week", i, ".json"),
    pretty = TRUE
  )
  
  # Girls data  
  jsonlite::write_json(
    df_points_girls_list[[i]], 
    paste0("girls_2023_week", i, ".json"),
    pretty = TRUE
  )
}

  jsonlite::write_json(
    schools, 
    paste0("schools.json"),
    pretty = TRUE
  )
