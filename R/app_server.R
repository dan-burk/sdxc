###################################################
# sdxc, a Shiny app for chating with your data
# Author: Daniel Burkhalter    dburkhalter1500@gmail.com
# Sep. 7, 2024.
# No warranty and not for commercial use.
###################################################

#' The application server-side
#'
#' @param input,output,session Internal parameters for {shiny}.
#'     DO NOT REMOVE.
#' @import shiny
#' @noRd
app_server <- function(input, output, session) {

#                            1.
#____________________________________________________________________________
#  General UI, observers, etc.
#____________________________________________________________________________

  # limit max file size to 10MB, if it is running on server
  if(file.exists(on_server)){ #server
    options(shiny.maxRequestSize = 50 * 1024^2) # 50 MB
  } else { # local
    options(shiny.maxRequestSize = 10000 * 1024^2) # 10 GB
  }

  if(dev.cur() == 1){
    pdf(NULL) #otherwise, base R plots sometimes do not show.
  }

  # Ensure all devices are closed when the session ends
  session$onSessionEnded(function() {
    while (dev.cur() > 1) {
      dev.off()
    }
    pdf(NULL)
  })

    # Render DataTable
  output$data_table_DT <- DT::renderDataTable({
    # Create or load your data here, for example:
    DT::datatable(
      df_boys %>%
        select(-X, -id) %>% 
        mutate(
          points = round(points, 2),
          time_min = convert_seconds_to_min_sec_hundredths(time_min)
          ) %>% 
        rename(`Season PR` = time_min, Points = points)
        )  # Using the iris dataset as an example
  })



}