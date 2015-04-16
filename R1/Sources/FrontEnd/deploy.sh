#!/bin/bash -v

rm -rf /ecoreal/htdocs/QuickQuotationFrontEnd
mkdir -p /ecoreal/htdocs/QuickQuotationFrontEnd

cp -rf ./dist/* /ecoreal/htdocs/QuickQuotationFrontEnd
